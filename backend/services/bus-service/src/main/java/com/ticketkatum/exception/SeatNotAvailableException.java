package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class SeatNotAvailableException extends BusServiceException {
    private final String seatNumber;

    public SeatNotAvailableException(String seatNumber) {
        super(String.format("Seat not available: %s", seatNumber));
        this.seatNumber = seatNumber;
    }
}
