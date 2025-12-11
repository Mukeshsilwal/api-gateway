package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class BookingAlreadyExistsException extends BookingServiceException {
    private final String bookingReference;

    public BookingAlreadyExistsException(String bookingReference) {
        super(String.format("Booking already exists: %s", bookingReference));
        this.bookingReference = bookingReference;
    }
}
