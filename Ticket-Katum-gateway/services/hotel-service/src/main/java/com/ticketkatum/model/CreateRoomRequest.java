package com.ticketkatum.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
public class CreateRoomRequest {
    private Long id;
    private String roomNumber;
    private String type;
    private String description;
    private Integer capacity;
    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private Set<String> amenities;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
