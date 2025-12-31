package com.ticketkatum.trackingservice.dto;

import com.ticketkatum.trackingservice.entity.LocationTracking;
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
    
    public static LocationDTO fromEntity(LocationTracking location) {
        if (location == null) {
            return null;
        }
        
        return LocationDTO.builder()
                .trackingId(location.getTrackingId())
                .tripId(location.getTripId())
                .entityType(location.getEntityType().name())
                .entityId(location.getEntityId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .altitude(location.getAltitude())
                .accuracy(location.getAccuracy())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .timestamp(location.getTimestamp())
                .isOffline(location.getIsOffline())
                .batteryLevel(location.getBatteryLevel())
                .createdAt(location.getCreatedAt())
                .build();
    }
}
