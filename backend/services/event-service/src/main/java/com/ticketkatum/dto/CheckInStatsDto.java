package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Check-In Stats DTO
 * Statistics for event check-ins
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInStatsDto {
    private Long eventId;
    private String eventName;
    private Integer totalTickets;
    private Integer checkedIn;
    private Integer pending;
    private Double checkInRate;
}
