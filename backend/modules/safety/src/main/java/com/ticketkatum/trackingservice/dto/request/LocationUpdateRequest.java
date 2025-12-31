package com.ticketkatum.trackingservice.dto.request;

import com.ticketkatum.trackingservice.entity.LocationTracking;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class LocationUpdateRequest {
    
    private Long tripId;
    
    @NotNull(message = "Entity type is required")
    private LocationTracking.EntityType entityType;
    
    @NotNull(message = "Entity ID is required")
    private Long entityId;
    
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
    private BigDecimal longitude;
    
    private BigDecimal altitude;
    private BigDecimal accuracy;
    private BigDecimal speed;
    private BigDecimal heading;
    
    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;
    
    private Boolean isOffline = false;
    private Integer batteryLevel;
}
