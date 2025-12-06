package com.ticketkatum.dto;

import lombok.Data;

@Data
public class HotelBookingResponse extends BaseBookingResponse {
    private String hotelName;
    private String roomType;
    private String checkInDate;
    private String checkOutDate;
    private Double totalAmount;

    public HotelBookingResponse() {
        setBookingType("HOTEL");
    }
}