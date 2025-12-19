package com.ticketkatum.model;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeInfo {
    private String roomType;
    private BigDecimal basePrice;
    private Integer availableRooms;
    private String description;
    private List<String> amenities;
}