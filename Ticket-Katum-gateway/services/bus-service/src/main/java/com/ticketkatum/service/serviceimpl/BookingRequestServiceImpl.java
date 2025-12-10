package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.BookingRequest;
import com.ticketkatum.entity.BookingTicket;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.entity.Ticket;
import com.ticketkatum.jms.EmailService;
import com.ticketkatum.mapper.BookingRequestMapper;
import com.ticketkatum.model.BookingRequestDto;
import com.ticketkatum.model.ReservationResponse;
import com.ticketkatum.repository.BookingRequestRepo;
import com.ticketkatum.repository.BookingTicketRepo;
import com.ticketkatum.repository.SeatRepo;
import com.ticketkatum.repository.TicketRepo;
import com.ticketkatum.service.BookingRequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingRequestServiceImpl implements BookingRequestService {

    private final SeatRepo seatRepo;
    private final BookingRequestRepo requestRepo;
    private final EmailService emailService;
    private final TicketRepo ticketRepo;
    private final BookingTicketRepo bookingTicketRepo;

    private final BookingRequestMapper bookingRequestMapper;

    /**
     * Reserve a specific seat for the user.
     */
    @Transactional
    @Override
    public ReservationResponse rserveSeat(BookingRequestDto requestDto, long seatId) {

        log.info("Reserving seat {} for {}", seatId, requestDto.getSeat().getSeatNumber());

        Seat seat = seatRepo.findSeatForUpdate(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        // Already reserved? Prevent double booking
        if (seat.isReserved()) {
            return new ReservationResponse(false, "Seat already booked. Try another seat.");
        }

        // Convert DTO → Entity using mapper
        BookingRequest request = bookingRequestMapper.toEntity(requestDto);

        // Attach the real seat entity (with lock)
        request.setSeat(seat);

        // Reserve seat
        seat.setReserved(true);
        seatRepo.save(seat);

        requestRepo.save(request);

        log.info("Seat {} reserved successfully", seatId);

        return new ReservationResponse(true, "Booking confirmed successfully");
    }

    /**
     * Cancel a booked ticket.
     */
    @Transactional
    @Override
    public void cancelReservation(String email, long ticketNo) {

        log.info("Cancel request for ticket {} by {}", ticketNo, email);

        Ticket ticket = ticketRepo.findById(ticketNo)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        BookingTicket bookingTicket = ticket.getBookingTicket();
        Seat seat = ticket.getSeat();

        if (bookingTicket == null) {
            throw new RuntimeException("No booking ticket associated with ticketNo: " + ticketNo);
        }

        if (!bookingTicket.getEmail().equals(email)) {
            throw new IllegalArgumentException("Email does not match the booking record");
        }

        if (bookingTicket.getTickets() != null) {
            bookingTicket.getTickets().remove(ticket);
        }
        ticket.setBookingTicket(null);

        if (seat != null) {
            seat.setReserved(false);
            seat.setTicket(null);
            seatRepo.save(seat);
        }

        requestRepo.deleteBySeatTicketTicketNoAndSeatTicketBookingTicketEmail(ticketNo, email);

        ticketRepo.delete(ticket);

        if (bookingTicket.getTickets() == null || bookingTicket.getTickets().isEmpty()) {
            bookingTicketRepo.delete(bookingTicket);
        } else {
            bookingTicketRepo.save(bookingTicket);
        }

        emailService.sendEmailForCancelTicket(
                email,
                "Ticket Cancellation Confirmation",
                "Your ticket has been successfully canceled."
        );

        log.info("Ticket {} canceled successfully by {}", ticketNo, email);
    }

    @Override
    public void cancelNotification(String email) {
        emailService.sendEmailForCancelTicket(email,
                "Ticket Cancellation Confirmation",
                "Your ticket has been successfully canceled.");
    }
}
