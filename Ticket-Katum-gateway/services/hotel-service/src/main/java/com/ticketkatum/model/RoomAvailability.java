package com.ticketkatum.model;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Room availability details
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailability {
    private String roomType;
    private Integer availableCount;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
    private List<String> amenities;
}
