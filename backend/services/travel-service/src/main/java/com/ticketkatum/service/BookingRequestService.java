package com.ticketkatum.service;


import com.ticketkatum.model.BookingRequestDto;
import com.ticketkatum.model.ReservationResponse;

public interface BookingRequestService {
    ReservationResponse rserveSeat(BookingRequestDto requestDto, long seatID);

    void cancelReservation(String email, long ticketNo);

    void cancelNotification(String email);
}
