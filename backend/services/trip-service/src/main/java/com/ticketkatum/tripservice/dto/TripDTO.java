package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.entity.Journey;
import com.ticketkatum.tripservice.entity.TimelineEvent;
import com.ticketkatum.tripservice.dto.JourneyDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO implements Serializable {

    private Long tripId;
    private Long userId;
    private Long guideId;
    private String tripName;
    private String tripType;
    private String touristType;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private BigDecimal actualCost;
    private String description;
    private List<TripCheckpointDTO> checkpoints;
    private List<TripBookingDTO> bookings;
    private List<TripParticipantDTO> participants;
    private List<ItineraryDayDTO> itineraryDays;
    private List<JourneyDTO> journeys;
    private List<java.util.Map<String, Object>> timelineEvents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Integer durationDays;
    private BigDecimal budgetRemaining;
    private Integer completedCheckpoints;
    private Integer totalCheckpoints;
    private Integer progressPercentage;

    public static TripDTO fromEntity(Trip trip) {
        if (trip == null) {
            return null;
        }

        TripDTO dto = TripDTO.builder()
                .tripId(trip.getTripId())
                .userId(trip.getUserId())
                .guideId(trip.getGuideId())
                .tripName(trip.getTripName())
                .tripType(trip.getTripType().name())
                .touristType(trip.getTouristType().name())
                .status(trip.getStatus().name())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .budget(trip.getBudget())
                .actualCost(trip.getActualCost())
                .description(trip.getDescription())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();

        // Calculate duration
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            dto.setDurationDays((int) java.time.temporal.ChronoUnit.DAYS.between(
                    trip.getStartDate(), trip.getEndDate()) + 1);
        }

        // Calculate budget remaining
        if (trip.getBudget() != null && trip.getActualCost() != null) {
            dto.setBudgetRemaining(trip.getBudget().subtract(trip.getActualCost()));
        }

        return dto;
    }

    public static TripDTO fromEntityWithDetails(Trip trip) {
        TripDTO dto = fromEntity(trip);
        if (dto == null) {
            return null;
        }

        // Add checkpoints
        if (trip.getCheckpoints() != null) {
            dto.setCheckpoints(trip.getCheckpoints().stream()
                    .map(TripCheckpointDTO::fromEntity)
                    .toList());

            // Calculate checkpoint progress
            long completed = trip.getCheckpoints().stream()
                    .filter(cp -> cp
                            .getStatus() == com.ticketkatum.tripservice.entity.TripCheckpoint.CheckpointStatus.COMPLETED)
                    .count();
            dto.setCompletedCheckpoints((int) completed);
            dto.setTotalCheckpoints(trip.getCheckpoints().size());

            if (trip.getCheckpoints().size() > 0) {
                dto.setProgressPercentage((int) ((completed * 100) / trip.getCheckpoints().size()));
            }
        }

        // Add bookings
        if (trip.getBookings() != null) {
            dto.setBookings(trip.getBookings().stream()
                    .map(TripBookingDTO::fromEntity)
                    .toList());
        }

        // Add participants
        if (trip.getParticipants() != null) {
            dto.setParticipants(trip.getParticipants().stream()
                    .map(TripParticipantDTO::fromEntity)
                    .toList());
        }

        // Add itinerary days
        if (trip.getItineraryDays() != null) {
            dto.setItineraryDays(trip.getItineraryDays().stream()
                    .map(ItineraryDayDTO::fromEntity)
                    .toList());
        }

        // Add journeys
        if (trip.getJourneys() != null) {
            dto.setJourneys(trip.getJourneys().stream()
                    .map(JourneyDTO::fromEntity)
                    .toList());
        }

        // Add timeline events
        if (trip.getTimelineEvents() != null) {
            dto.setTimelineEvents(trip.getTimelineEvents().stream()
                    .map(event -> {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("eventId", event.getEventId());
                        map.put("type", event.getEventType());
                        map.put("description", event.getDescription());
                        map.put("createdAt", event.getCreatedAt());
                        return map;
                    })
                    .toList());
        }

        return dto;
    }
}
