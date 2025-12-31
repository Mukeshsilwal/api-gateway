package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class BookingNotFoundException extends BookingServiceException {
    private final Long bookingId;

    public BookingNotFoundException(Long bookingId) {
        super(String.format("Booking not found with ID: %d", bookingId));
        this.bookingId = bookingId;
    }
}
