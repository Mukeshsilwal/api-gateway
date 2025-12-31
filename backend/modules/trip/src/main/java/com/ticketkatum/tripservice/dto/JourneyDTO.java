package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.Journey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneyDTO {

    private Long journeyId;
    private Long tripId;
    private Long userId;
    private String status;
    private Long itineraryDayId;
    private Map<String, Object> bookingReference;
    private BigDecimal totalEstimatedCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Legacy fields or derived for frontend compatibility
    private String type;

    public static JourneyDTO fromEntity(Journey journey) {
        if (journey == null) {
            return null;
        }

        JourneyDTO dto = JourneyDTO.builder()
                .journeyId(journey.getJourneyId())
                .tripId(journey.getTrip() != null ? journey.getTrip().getTripId() : null)
                .userId(journey.getUserId())
                .status(journey.getStatus().name())
                .itineraryDayId(journey.getItineraryDay() != null ? journey.getItineraryDay().getDayId() : null)
                .bookingReference(journey.getBookingReference())
                .totalEstimatedCost(journey.getTotalEstimatedCost())
                .createdAt(journey.getCreatedAt())
                .updatedAt(journey.getUpdatedAt())
                .build();

        if (journey.getBookingReference() != null && journey.getBookingReference().containsKey("type")) {
            dto.setType((String) journey.getBookingReference().get("type"));
        } else {
            dto.setType("UNKNOWN");
        }

        return dto;
    }
}
