package com.ticketkatum.service;


import com.ticketkatum.model.BookingTicketDto;

import java.util.List;

public interface BookingTicketService {
    List<BookingTicketDto> getAllBooking();

    BookingTicketDto getBooking(long bookingId);

    BookingTicketDto createBooking(BookingTicketDto bookingTicketDto);

}
