package com.ticketkatum.journeyservice.dto;

import com.ticketkatum.journeyservice.entity.Journey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneyDTO {

    private Long journeyId;
    private Long tripId;
    private Long userId;
    private Journey.JourneyStatus status;
    private BigDecimal optimizationScore;
    private BigDecimal totalDistanceKm;
    private BigDecimal estimatedDurationHours;
    private BigDecimal totalEstimatedCost;
    
    @Builder.Default
    private List<SegmentDTO> segments = new ArrayList<>();
    
    @Builder.Default
    private List<SuggestionDTO> suggestions = new ArrayList<>();
    
    @Builder.Default
    private List<WaypointDTO> waypoints = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
