package com.ticketkatum.timelineservice.dto;

import com.ticketkatum.timelineservice.entity.Checkpoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckpointDTO {

    private Long checkpointId;
    private Checkpoint.CheckpointType checkpointType;
    private String locationName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime scheduledTime;
    private LocalDateTime actualTime;
    private LocalDateTime estimatedArrivalTime;
    private Checkpoint.CheckpointStatus status;
    private Integer sequenceOrder;
    private Integer durationMinutes;
    private String notes;
    private Boolean reminderSent;
    private Long delayMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
