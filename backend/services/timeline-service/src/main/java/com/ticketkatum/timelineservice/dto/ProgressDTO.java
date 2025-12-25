package com.ticketkatum.timelineservice.dto;

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
public class ProgressDTO {

    private Long timelineId;
    private BigDecimal progressPercentage;
    private Integer totalCheckpoints;
    private Integer completedCheckpoints;
    private Integer pendingCheckpoints;
    private CheckpointDTO currentCheckpoint;
    private CheckpointDTO nextCheckpoint;
    private Boolean isOnSchedule;
    private Integer totalDelayMinutes;
    private LocalDateTime estimatedCompletionTime;
}
