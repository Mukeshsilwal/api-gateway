package com.ticketkatum.alertservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
        @Index(name = "idx_alert_type", columnList = "alert_type"),
        @Index(name = "idx_severity", columnList = "severity"),
        @Index(name = "idx_region", columnList = "affected_region"),
        @Index(name = "idx_active", columnList = "is_active"),
        @Index(name = "idx_valid_period", columnList = "valid_from,valid_until")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity = Severity.MEDIUM;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "affected_region")
    private String affectedRegion;

    @Column(name = "affected_routes", columnDefinition = "TEXT")
    private String affectedRoutes;

    @Column(name = "affected_districts", columnDefinition = "TEXT")
    private String affectedDistricts;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "radius_km", precision = 6, scale = 2)
    private BigDecimal radiusKm;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "created_by")
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum AlertType {
        WEATHER,
        ROAD_BLOCK,
        DELAY,
        STRIKE,
        EMERGENCY,
        SAFETY,
        MAINTENANCE,
        EVENT
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    // Helper methods
    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               validFrom.isBefore(now) && 
               (validUntil == null || validUntil.isAfter(now));
    }
}
