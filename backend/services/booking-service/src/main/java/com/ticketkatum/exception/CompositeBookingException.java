package com.ticketkatum.exception;

public class CompositeBookingException extends RuntimeException {
    public CompositeBookingException(String message) {
        super(message);
    }

    public CompositeBookingException(String message, Throwable cause) {
        super(message, cause);
    }
}
