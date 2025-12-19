package com.ticketkatum.exception;

/**
 * Base exception for all bus service exceptions
 */
public class BusServiceException extends RuntimeException {

    public BusServiceException(String message) {
        super(message);
    }

    public BusServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
