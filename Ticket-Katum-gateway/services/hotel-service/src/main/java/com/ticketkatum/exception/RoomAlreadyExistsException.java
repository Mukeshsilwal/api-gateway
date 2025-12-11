package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when a room already exists with the same room number in a
 * hotel
 */
@Getter
public class RoomAlreadyExistsException extends HotelServiceException {

    private final String roomNumber;
    private final String hotelCode;

    public RoomAlreadyExistsException(String roomNumber, String hotelCode) {
        super(String.format("Room '%s' already exists in hotel '%s'", roomNumber, hotelCode));
        this.roomNumber = roomNumber;
        this.hotelCode = hotelCode;
    }
}
