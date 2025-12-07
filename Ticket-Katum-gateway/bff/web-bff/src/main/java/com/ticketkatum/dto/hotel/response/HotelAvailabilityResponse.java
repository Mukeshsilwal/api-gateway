package com.ticketkatum.dto.hotel.response;

import com.ticketkatum.dto.hotel.RoomAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityResponse {
    private Long hotelId;
    private boolean available;
    private String message;
    private List<RoomAvailability> roomAvailabilities;
    private BigDecimal totalPrice;
}
