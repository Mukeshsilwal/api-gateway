package com.ticketkatum.timelineservice.dto;

import com.ticketkatum.timelineservice.entity.Timeline;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineDTO {

    private Long timelineId;
    private Long journeyId;
    private Long tripId;
    private Long userId;
    private Long currentCheckpointId;
    private BigDecimal progressPercentage;
    private Boolean isOnSchedule;
    private Integer delayMinutes;
    private Timeline.TimelineStatus status;
    
    private List<CheckpointDTO> checkpoints;
    private List<DelayDTO> delays;
    private List<NotificationDTO> notifications;
    
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
}
