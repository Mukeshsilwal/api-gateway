package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when room data validation fails
 */
@Getter
public class InvalidRoomDataException extends HotelServiceException {

    private final String field;
    private final Object value;

    public InvalidRoomDataException(String message) {
        super(message);
        this.field = null;
        this.value = null;
    }

    public InvalidRoomDataException(String field, Object value, String message) {
        super(String.format("Invalid %s: %s. %s", field, value, message));
        this.field = field;
        this.value = value;
    }

    public InvalidRoomDataException(String message, Throwable cause) {
        super(message, cause);
        this.field = null;
        this.value = null;
    }
}
