package com.ticketkatum.timelineservice.dto;

import com.ticketkatum.timelineservice.entity.Checkpoint;
import jakarta.validation.constraints.NotNull;
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
public class CreateCheckpointRequest {

    @NotNull(message = "Checkpoint type is required")
    private Checkpoint.CheckpointType checkpointType;

    @NotNull(message = "Location name is required")
    private String locationName;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;

    private Integer durationMinutes;
    private String notes;
}
