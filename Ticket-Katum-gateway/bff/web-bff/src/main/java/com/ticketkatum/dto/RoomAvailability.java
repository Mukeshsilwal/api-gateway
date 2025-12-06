package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    private String roomType;
    private Integer availableCount;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
}
