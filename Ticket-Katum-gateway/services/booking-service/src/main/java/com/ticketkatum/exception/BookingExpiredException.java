package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class BookingExpiredException extends BookingServiceException {
    private final Long bookingId;

    public BookingExpiredException(Long bookingId) {
        super(String.format("Booking expired: %d", bookingId));
        this.bookingId = bookingId;
    }
}
