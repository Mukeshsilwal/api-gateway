package com.ticketkatum.journeyservice.dto;

import com.ticketkatum.journeyservice.entity.JourneyWaypoint;
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
public class WaypointDTO {

    private Long waypointId;
    private Integer sequenceOrder;
    private String locationName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private JourneyWaypoint.WaypointType waypointType;
    private LocalDateTime arrivalTime;
    private LocalDateTime departureTime;
    private Integer durationMinutes;
    private Boolean isMandatory;
}
