package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when a hotel is not found
 */
@Getter
public class HotelNotFoundException extends HotelServiceException {

    private final Long hotelId;
    private final String hotelCode;

    public HotelNotFoundException(Long hotelId) {
        super(String.format("Hotel not found with ID: %d", hotelId));
        this.hotelId = hotelId;
        this.hotelCode = null;
    }

    public HotelNotFoundException(String hotelCode) {
        super(String.format("Hotel not found with code: %s", hotelCode));
        this.hotelId = null;
        this.hotelCode = hotelCode;
    }
}
