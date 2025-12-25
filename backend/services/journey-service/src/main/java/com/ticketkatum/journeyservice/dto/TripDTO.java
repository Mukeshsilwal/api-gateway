package com.ticketkatum.journeyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for trip data from trip-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private Long tripId;
    private Long userId;
    private String tripName;
    private String tripType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal budget;
    private String description;
    private String status;
}
