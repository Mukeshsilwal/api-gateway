package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class InvalidTicketException extends BusServiceException {
    private final String ticketNumber;

    public InvalidTicketException(String ticketNumber) {
        super(String.format("Invalid ticket: %s", ticketNumber));
        this.ticketNumber = ticketNumber;
    }
}
