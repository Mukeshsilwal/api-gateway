package com.ticketkatum.timelineservice.dto;

import com.ticketkatum.timelineservice.entity.Delay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelayDTO {

    private Long delayId;
    private Long checkpointId;
    private Delay.DelayType delayType;
    private Integer delayMinutes;
    private String reason;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;
    private Boolean isResolved;
}
