package com.ticketkatum.dto;

import lombok.Data;

@Data
public abstract class BaseBookingResponse {
    private String bookingType; // HOTEL, BUS, MOVIE
    private String bookingId;
    private String confirmationNumber;
}
