package com.ticketkatum.dto.hotel.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingRequest {
    private Long hotelId;
    private String hotelCode;
    private List<Long> roomIds;
    private String checkIn;
    private String checkOut;
    private Integer numberOfGuests;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;
    private String category;
    private String service;
    private Map<String, Object> metadata;
}
