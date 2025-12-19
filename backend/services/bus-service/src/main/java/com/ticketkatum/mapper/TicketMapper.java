package com.ticketkatum.mapper;

import com.ticketkatum.entity.BookingTicket;
import com.ticketkatum.entity.Ticket;
import com.ticketkatum.model.BookingTicketDto;
import com.ticketkatum.model.SeatDto;
import com.ticketkatum.model.TicketDto;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketDto toDto(Ticket ticket) {

        if (ticket == null) return null;

        TicketDto dto = new TicketDto();
        dto.setTicketNo(ticket.getTicketNo());
        dto.setTicketNo(ticket.getTicketNo());

        if (ticket.getBookingTicket() != null) {
            BookingTicketDto bookingDto = new BookingTicketDto();
            bookingDto.setBookingId(ticket.getBookingTicket().getId());
            bookingDto.setFullName(ticket.getBookingTicket().getFullName());
            bookingDto.setEmail(ticket.getBookingTicket().getEmail());
            dto.setBookingTicket(bookingDto);
        }


        if (ticket.getSeat() != null) {
            SeatDto seatDto = new SeatDto();
            seatDto.setBusId(ticket.getSeat().getBus().getId());
            seatDto.setSeatNumber(ticket.getSeat().getSeatNumber());
            seatDto.setReserved(ticket.getSeat().isReserved());
            seatDto.setPrice(ticket.getSeat().getPrice());
        }

        return dto;
    }


    public Ticket toEntity(TicketDto dto) {

        if (dto == null) return null;

        Ticket ticket = new Ticket();
        ticket.setTicketNo(dto.getTicketNo());
        ticket.setTicketNo(dto.getTicketNo());

        if (dto.getBookingTicket() != null) {
            BookingTicket booking = new BookingTicket();
            booking.setId(dto.getBookingTicket().getBookingId());
            booking.setFullName(dto.getBookingTicket().getFullName());
            booking.setEmail(dto.getBookingTicket().getEmail());
            ticket.setBookingTicket(booking);
        }

        return ticket;
    }
}
