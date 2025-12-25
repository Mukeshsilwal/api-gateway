package com.ticketkatum.journeyservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event published when a journey is created
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneyCreatedEvent {
    
    private Long journeyId;
    private Long tripId;
    private Long userId;
    private String status;
    private BigDecimal totalEstimatedCost;
    private BigDecimal estimatedDurationHours;
    private Integer segmentCount;
    private LocalDateTime createdAt;
    
    private String eventId;
    private LocalDateTime eventTimestamp;
    
    public static JourneyCreatedEvent from(Long journeyId, Long tripId, Long userId, 
                                           String status, BigDecimal cost, 
                                           BigDecimal duration, Integer segmentCount) {
        return JourneyCreatedEvent.builder()
                .journeyId(journeyId)
                .tripId(tripId)
                .userId(userId)
                .status(status)
                .totalEstimatedCost(cost)
                .estimatedDurationHours(duration)
                .segmentCount(segmentCount)
                .createdAt(LocalDateTime.now())
                .eventId(java.util.UUID.randomUUID().toString())
                .eventTimestamp(LocalDateTime.now())
                .build();
    }
}
