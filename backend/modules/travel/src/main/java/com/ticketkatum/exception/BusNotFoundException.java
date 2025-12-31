package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class BusNotFoundException extends BusServiceException {
    private final Long busId;

    public BusNotFoundException(Long busId) {
        super(String.format("Bus not found with ID: %d", busId));
        this.busId = busId;
    }
}
