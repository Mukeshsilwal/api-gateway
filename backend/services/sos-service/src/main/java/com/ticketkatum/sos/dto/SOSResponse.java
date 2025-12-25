package com.ticketkatum.sos.dto;

import com.ticketkatum.sos.entity.EmergencyAlert;
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
public class SOSResponse {

    private Long alertId;
    private Long userId;
    private Long tripId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private String description;
    private LocalDateTime triggeredAt;
    private LocalDateTime resolvedAt;

    public static SOSResponse fromEntity(EmergencyAlert alert) {
        return SOSResponse.builder()
                .alertId(alert.getAlertId())
                .userId(alert.getUserId())
                .tripId(alert.getTripId())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .status(alert.getStatus().name())
                .description(alert.getDescription())
                .triggeredAt(alert.getTriggeredAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
