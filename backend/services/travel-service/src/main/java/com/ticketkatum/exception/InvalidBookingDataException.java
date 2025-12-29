package com.ticketkatum.exception;

public class InvalidBookingDataException extends BookingServiceException {
    public InvalidBookingDataException(String message) {
        super(message);
    }
}
