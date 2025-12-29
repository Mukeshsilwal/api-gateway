package com.ticketkatum.model;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability implements Serializable {
    private static final long serialVersionUID = 1L;

    private String roomType;
    private Integer availableCount;
    private BigDecimal pricePerNight;
    private BigDecimal totalPrice;
}