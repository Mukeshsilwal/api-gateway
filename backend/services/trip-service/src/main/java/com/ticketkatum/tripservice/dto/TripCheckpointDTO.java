package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.TripCheckpoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCheckpointDTO implements Serializable {

    private Long checkpointId;
    private Long tripId;
    private String checkpointType;
    private String locationName;
    private LocalDateTime scheduledTime;
    private LocalDateTime actualTime;
    private String status;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Integer delayMinutes;
    private Boolean isUpcoming;
    private Boolean isOverdue;

    public static TripCheckpointDTO fromEntity(TripCheckpoint checkpoint) {
        if (checkpoint == null) {
            return null;
        }

        TripCheckpointDTO dto = TripCheckpointDTO.builder()
                .checkpointId(checkpoint.getCheckpointId())
                .tripId(checkpoint.getTrip() != null ? checkpoint.getTrip().getTripId() : null)
                .checkpointType(checkpoint.getCheckpointType().name())
                .locationName(checkpoint.getLocationName())
                .scheduledTime(checkpoint.getScheduledTime())
                .actualTime(checkpoint.getActualTime())
                .status(checkpoint.getStatus().name())
                .latitude(checkpoint.getLatitude())
                .longitude(checkpoint.getLongitude())
                .notes(checkpoint.getNotes())
                .createdAt(checkpoint.getCreatedAt())
                .updatedAt(checkpoint.getUpdatedAt())
                .build();

        // Calculate delay
        if (checkpoint.getActualTime() != null && checkpoint.getScheduledTime() != null) {
            long minutes = java.time.Duration.between(
                    checkpoint.getScheduledTime(),
                    checkpoint.getActualTime()).toMinutes();
            dto.setDelayMinutes((int) minutes);
        }

        // Check if upcoming
        LocalDateTime now = LocalDateTime.now();
        if (checkpoint.getScheduledTime() != null) {
            dto.setIsUpcoming(checkpoint.getScheduledTime().isAfter(now) &&
                    checkpoint.getStatus() == TripCheckpoint.CheckpointStatus.PENDING);
            dto.setIsOverdue(checkpoint.getScheduledTime().isBefore(now) &&
                    checkpoint.getStatus() == TripCheckpoint.CheckpointStatus.PENDING);
        }

        return dto;
    }
}
