package com.ticketkatum.dto;


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
public class RoomTypeInfo {
    private String roomType;
    private String description;
    private BigDecimal basePrice;
    private Integer maxOccupancy;
    private List<String> amenities;
    private Integer availableCount;
}