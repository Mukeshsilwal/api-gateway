package com.ticketkatum.dto.tracking;

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
public class LocationDTO {

    private Long trackingId;
    private Long tripId;
    private String entityType;
    private Long entityId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal altitude;
    private BigDecimal accuracy;
    private BigDecimal speed;
    private BigDecimal heading;
    private LocalDateTime timestamp;
    private Boolean isOffline;
    private Integer batteryLevel;
    private LocalDateTime createdAt;

    // Computed fields
    private Double distanceFromPrevious;
    private String locationName;
}
