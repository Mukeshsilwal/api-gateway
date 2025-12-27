package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.BookingTicket;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.entity.Ticket;
import com.ticketkatum.enums.TicketStatus;
import com.ticketkatum.mapper.BookingMapper;
import com.ticketkatum.model.BookingTicketDto;
import com.ticketkatum.repository.BookingTicketRepo;
import com.ticketkatum.repository.SeatRepo;
import com.ticketkatum.service.BookingTicketService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingTicketServiceImpl implements BookingTicketService {

    private final BookingTicketRepo bookingTicketRepo;
    private final SeatRepo seatRepo;
    private final com.ticketkatum.service.SeatService seatService; // Added dependency
    private final BookingMapper mapper;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<BookingTicketDto> getAllBooking() {
        return bookingTicketRepo.findAll()
                .stream().map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookingTicketDto getBooking(long bookingId) {
        BookingTicket booking = bookingTicketRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("BookingTicket" + bookingId));

        return mapper.toDto(booking);
    }

    @Transactional
    @Override
    public BookingTicketDto createBooking(BookingTicketDto dto) {

        if (dto.getSeatIds() == null || dto.getSeatIds().isEmpty()) {
            throw new IllegalArgumentException("Seat IDs cannot be null or empty");
        }

        if (dto.getSeatIds().contains(null)) {
            throw new IllegalArgumentException("Seat List contains null IDs");
        }

        // 1. Validate and Confirm Seats (Hard Lock)
        // This relies on the "Soft Hold" being present.
        // If not held by this user, confirmSeat will throw exception.
        List<Seat> confirmedSeats = dto.getSeatIds().stream()
                .map(seatId -> {
                    // This call will convert HELD -> BOOKED and verify ownership
                    com.ticketkatum.model.SeatDto seatDto = seatService.confirmSeat(seatId, dto.getUserId());
                    return seatRepo.findById(seatId).orElseThrow();
                })
                .collect(Collectors.toList());

        BookingTicket booking = new BookingTicket();
        booking.setFullName(dto.getFullName());
        booking.setEmail(dto.getEmail());
        booking.setBookingTime(LocalDateTime.now());

        List<Ticket> tickets = confirmedSeats.stream()
                .map(seat -> Ticket.builder()
                        .seat(seat)
                        .status(TicketStatus.SOLD)
                        .bookingTicket(booking)
                        .build())
                .collect(Collectors.toList());

        booking.setTickets(tickets);

        BookingTicket saved = bookingTicketRepo.save(booking);

        // Publish Event
        if (!confirmedSeats.isEmpty()) {
            com.ticketkatum.entity.Seat firstSeat = confirmedSeats.get(0);
            com.ticketkatum.entity.Bus bus = firstSeat.getBus();
            if (bus != null && bus.getRoute() != null) {
                com.ticketkatum.events.BusBookingCreatedEvent event = com.ticketkatum.events.BusBookingCreatedEvent
                        .builder()
                        .bookingId(saved.getId())
                        .tripId(dto.getTripId())
                        .userId(dto.getUserId())
                        .source(bus.getRoute().getSourceBusStop().getName())
                        .destination(bus.getRoute().getDestinationBusStop().getName())
                        .departureTime(bus.getDepartureDateTime())
                        .arrivalTime(bus.getDepartureDateTime().plusHours(6)) // Estimated: Move to Route entity later
                        .build();

                try {
                    kafkaTemplate.send("bus.booking.created", event);
                } catch (Exception e) {
                    // Log but don't fail transaction
                    e.printStackTrace();
                }
            }
        }

        return mapper.toDto(saved);
    }
}
