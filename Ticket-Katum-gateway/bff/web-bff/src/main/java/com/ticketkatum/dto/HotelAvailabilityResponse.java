package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityResponse {
    private Long hotelId;
    private String hotelName;
    private Boolean available;
    private List<RoomAvailability> availableRooms;
    private String checkInDate;
    private String checkOutDate;
    private Integer numberOfNights;
}
