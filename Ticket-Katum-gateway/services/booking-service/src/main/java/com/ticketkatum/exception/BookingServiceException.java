package com.ticketkatum.exception;

/**
 * Base exception for all booking service exceptions
 */
public class BookingServiceException extends RuntimeException {

    public BookingServiceException(String message) {
        super(message);
    }

    public BookingServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
