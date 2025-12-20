package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String roomType;
    private String description;
    private Integer capacity;
    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private Set<String> amenities;
    private Set<String> images;
    private boolean active;
    private long hotelId;
    private String hotelCode;
    private String hotelName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
