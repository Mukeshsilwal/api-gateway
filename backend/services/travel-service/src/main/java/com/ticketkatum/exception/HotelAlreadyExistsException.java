package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when a hotel already exists
 */
@Getter
public class HotelAlreadyExistsException extends HotelServiceException {

    private final String hotelCode;

    public HotelAlreadyExistsException(String hotelCode) {
        super(String.format("Hotel already exists with code: %s", hotelCode));
        this.hotelCode = hotelCode;
    }
}
