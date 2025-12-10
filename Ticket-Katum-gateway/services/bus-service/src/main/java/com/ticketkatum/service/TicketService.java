package com.ticketkatum.service;

import com.ticketkatum.model.TicketDto;

import java.util.List;

public interface TicketService {

    TicketDto updateTicket(TicketDto ticketDto, long ticketId);

    TicketDto createSeatWithTicket(TicketDto ticketDto, long seatId, long bookingId);

    void deleteSeatWithTicket(long ticketId);

    TicketDto getTicketById(long ticketId);

    void sendBookingConfirmationEmail(String userEmail, byte[] pdfContent);

    List<TicketDto> getTicketsByBooking(long bookingId);

    List<TicketDto> getTicketsBySeat(long seatId);
}
