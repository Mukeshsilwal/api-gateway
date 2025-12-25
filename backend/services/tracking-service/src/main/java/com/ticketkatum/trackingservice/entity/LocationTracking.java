package com.ticketkatum.trackingservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "location_tracking", indexes = {
        @Index(name = "idx_trip_id", columnList = "trip_id"),
        @Index(name = "idx_entity", columnList = "entity_type,entity_id"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LocationTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tracking_id")
    private Long trackingId;

    @Column(name = "trip_id")
    private Long tripId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "altitude", precision = 8, scale = 2)
    private BigDecimal altitude;

    @Column(name = "accuracy", precision = 6, scale = 2)
    private BigDecimal accuracy;

    @Column(name = "speed", precision = 6, scale = 2)
    private BigDecimal speed;

    @Column(name = "heading", precision = 5, scale = 2)
    private BigDecimal heading;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_offline")
    private Boolean isOffline = false;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enums
    public enum EntityType {
        BUS,
        TOURIST,
        GUIDE,
        VEHICLE
    }

    // Helper methods
    public double getLatitudeAsDouble() {
        return latitude != null ? latitude.doubleValue() : 0.0;
    }

    public double getLongitudeAsDouble() {
        return longitude != null ? longitude.doubleValue() : 0.0;
    }

    public double getAltitudeAsDouble() {
        return altitude != null ? altitude.doubleValue() : 0.0;
    }
}
