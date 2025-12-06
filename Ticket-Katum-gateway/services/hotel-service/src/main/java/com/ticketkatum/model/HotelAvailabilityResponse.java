package com.ticketkatum.model;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelAvailabilityResponse {
    private Long hotelId;
    private String hotelName;
    private Boolean available;
    private List<RoomAvailability> availableRooms;
    private String checkInDate;
    private String checkOutDate;
    private Integer numberOfNights;
    private BigDecimal totalEstimatedCost;
}
