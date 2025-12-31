package com.ticketkatum.exception;

/**
 * Base exception for all hotel service exceptions
 */
public class HotelServiceException extends RuntimeException {

    public HotelServiceException(String message) {
        super(message);
    }

    public HotelServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
