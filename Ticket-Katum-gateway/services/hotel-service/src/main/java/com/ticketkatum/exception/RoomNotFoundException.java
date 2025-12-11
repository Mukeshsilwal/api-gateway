package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when a room is not found
 */
@Getter
public class RoomNotFoundException extends HotelServiceException {

    private final Long roomId;

    public RoomNotFoundException(Long roomId) {
        super(String.format("Room not found with ID: %d", roomId));
        this.roomId = roomId;
    }
}
