package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.BookingTicket;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.entity.Ticket;
import com.ticketkatum.jms.TravelEmailService;
import com.ticketkatum.mapper.TicketMapper;
import com.ticketkatum.model.TicketDto;
import com.ticketkatum.redis.TicketCacheService;
import com.ticketkatum.redis.booking.BookingNotificationService;
import com.ticketkatum.redis.booking.BookingRateLimiter;
import com.ticketkatum.redis.seat.SeatLockService;
import com.ticketkatum.redis.seat.SeatReservationCache;
import com.ticketkatum.repository.BookingTicketRepo;
import com.ticketkatum.repository.SeatRepo;
import com.ticketkatum.repository.TicketRepo;
import com.ticketkatum.service.TicketService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepo ticketRepo;
    private final BookingTicketRepo bookingTicketRepo;
    private final SeatRepo seatRepo;
    private final TravelEmailService emailService;
    private final TicketMapper ticketMapper;

    private final TicketCacheService cacheService;
    private final SeatLockService seatLockService;
    private final SeatReservationCache seatReservationCache;
    private final BookingNotificationService notificationService;
    private final BookingRateLimiter rateLimiter;

    @Override
    @Async
    public void sendBookingConfirmationEmail(String userEmail, byte[] pdfContent) {
        try {
            emailService.sendEmailWithAttachment(
                    userEmail,
                    "Booking Confirmation",
                    "Thank you for booking with TicketKatum. Your ticket is attached.",
                    pdfContent
            );
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to {}: {}", userEmail, e.getMessage());
        }
    }

    // ---------------- UPDATE --------------------
    @Override
    @Transactional
    public TicketDto updateTicket(TicketDto ticketDto, long ticketId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException());

        ticket.setTicketNo(ticketDto.getTicketNo());
        ticket.getBookingTicket().setFullName(ticketDto.getBookingTicket().getFullName());
        ticket.getBookingTicket().setEmail(ticketDto.getBookingTicket().getEmail());

        Ticket updated = ticketRepo.save(ticket);
        TicketDto updatedDto = ticketMapper.toDto(updated);

        cacheService.cacheTicket(updatedDto);

        cacheService.evictBookingTickets(updated.getBookingTicket().getId());

        notificationService.publishBookingUpdated(ticketId);

        log.info("Updated ticket {} and invalidated related caches", ticketId);

        return updatedDto;
    }

    @Transactional
    @Override
    public TicketDto createSeatWithTicket(TicketDto ticketDto, long seatId, long bookingId) {

        String lockValue = null;

        try {
            BookingTicket booking = bookingTicketRepo.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException());

            String userEmail = booking.getEmail();
            if (!rateLimiter.canCreateTicket(userEmail)) {
                throw new RuntimeException("Rate limit exceeded. Please try again later.");
            }

            if (seatLockService.isSeatLocked(seatId)) {
                throw new RuntimeException("Seat is currently being booked by another user. Please try again.");
            }

            lockValue = seatLockService.acquireSeatLock(seatId);
            if (lockValue == null) {
                throw new RuntimeException("Unable to acquire lock for seat. Please try again.");
            }

            if (seatReservationCache.isSeatReservedInCache(seatId)) {
                throw new RuntimeException("This seat is already booked (cached).");
            }

            Seat seat = seatRepo.findById(seatId)
                    .orElseThrow(() -> new RuntimeException());

            if (seat.isReserved()) {
                throw new RuntimeException();
            }

            Ticket ticket = ticketMapper.toEntity(ticketDto);
            ticket.setSeat(seat);
            ticket.setBookingTicket(booking);

            seat.setReserved(true);
            seatRepo.save(seat);

            Ticket savedTicket = ticketRepo.save(ticket);
            booking.getTickets().add(savedTicket);

            TicketDto savedTicketDto = ticketMapper.toDto(savedTicket);

            cacheService.cacheTicket(savedTicketDto);
            seatReservationCache.markSeatAsReserved(seatId, bookingId);
            cacheService.evictBookingTickets(bookingId);

            notificationService.publishBookingCreated(
                    savedTicket.getTicketNo(),
                    bookingId,
                    seatId
            );

            log.info("Created ticket {} for seat {} with Redis caching",
                    savedTicket.getTicketNo(), seatId);

            return savedTicketDto;

        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Duplicate Ticket Detected.");
        } finally {
            if (lockValue != null) {
                seatLockService.releaseSeatLock(seatId, lockValue);
            }
        }
    }

    @Transactional
    @Override
    public void deleteSeatWithTicket(long ticketId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException());

        Seat seat = ticket.getSeat();
        long seatId = seat != null ? seat.getId() : 0;
        long bookingId = ticket.getBookingTicket() != null ?
                ticket.getBookingTicket().getId() : 0;

        if (seat != null) {
            seat.setReserved(false);
            seatRepo.save(seat);

            seatReservationCache.clearSeatReservation(seatId, bookingId);
        }

        BookingTicket booking = ticket.getBookingTicket();
        if (booking != null) {
            booking.getTickets().remove(ticket);
            bookingTicketRepo.save(booking);

            cacheService.evictBookingTickets(bookingId);
        }

        ticketRepo.delete(ticket);

        cacheService.evictTicket(ticketId);

        notificationService.publishBookingCancelled(ticketId, seatId);

        log.info("Deleted ticket {} and cleared all related caches", ticketId);
    }

    @Override
    public TicketDto getTicketById(long ticketId) {
        TicketDto cached = cacheService.getTicket(ticketId);
        if (cached != null) {
            log.info("Cache hit for ticket {}", ticketId);
            return cached;
        }

        log.info("Cache miss for ticket {}, fetching from database", ticketId);
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException());

        TicketDto ticketDto = ticketMapper.toDto(ticket);

        cacheService.cacheTicket(ticketDto);

        return ticketDto;
    }

    @Override
    public List<TicketDto> getTicketsByBooking(long bookingId) {
        List<TicketDto> cached = cacheService.getBookingTicketsFromCache(bookingId);
        if (cached != null) {
            log.info("Cache hit for booking tickets {}", bookingId);
            return cached;
        }

        log.info("Cache miss for booking tickets {}, fetching from database", bookingId);
        List<TicketDto> tickets = ticketRepo.findTicketBySeat_Id(bookingId)
                .stream()
                .map(ticketMapper::toDto)
                .collect(Collectors.toList());

        cacheService.cacheBookingTickets(bookingId, tickets);

        return tickets;
    }

    @Override
    public List<TicketDto> getTicketsBySeat(long seatId) {
        return ticketRepo.findTicketBySeat_Id(seatId)
                .stream()
                .map(ticketMapper::toDto)
                .collect(Collectors.toList());
    }
}
