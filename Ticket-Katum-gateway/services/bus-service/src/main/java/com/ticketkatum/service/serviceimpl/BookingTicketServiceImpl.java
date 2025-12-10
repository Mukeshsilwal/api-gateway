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
    private final BookingMapper mapper;

    @Override
    public List<BookingTicketDto> getAllBooking() {
        return bookingTicketRepo.findAll()
                .stream().map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookingTicketDto getBooking(long bookingId) {
        BookingTicket booking = bookingTicketRepo.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("BookingTicket"+ bookingId));

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

        List<Seat> seats = seatRepo.findAllById(dto.getSeatIds());

        if (seats.size() != dto.getSeatIds().size()) {
            throw new RuntimeException(
                    "Seat"+ dto.getSeatIds().size());
        }

        seats.forEach(seat -> {
            if (seat.isReserved()) {
                throw new RuntimeException(
                        "Seat " + seat.getSeatNumber() + " is already reserved."
                );
            }
        });

        seats.forEach(seat -> seat.setReserved(true));
        seatRepo.saveAll(seats);

        BookingTicket booking = new BookingTicket();
        booking.setFullName(dto.getFullName());
        booking.setEmail(dto.getEmail());
        booking.setBookingTime(LocalDateTime.now());

        List<Ticket> tickets = seats.stream()
                .map(seat ->
                        Ticket.builder()
                                .seat(seat)
                                .status(TicketStatus.SOLD)
                                .bookingTicket(booking)
                                .build()
                ).collect(Collectors.toList());

        booking.setTickets(tickets);

        BookingTicket saved = bookingTicketRepo.save(booking);

        return mapper.toDto(saved);
    }
}
