package com.ticketkatum.exception;

/**
 * Exception thrown when hotel data is invalid
 */
public class InvalidHotelDataException extends HotelServiceException {

    public InvalidHotelDataException(String message) {
        super(message);
    }

    public InvalidHotelDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
