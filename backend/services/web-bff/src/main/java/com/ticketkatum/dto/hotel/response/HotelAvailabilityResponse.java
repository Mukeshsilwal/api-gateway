package com.ticketkatum.dto.hotel.response;

import com.ticketkatum.dto.hotel.RoomAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfNights;
    private BigDecimal totalEstimatedCost;
}
