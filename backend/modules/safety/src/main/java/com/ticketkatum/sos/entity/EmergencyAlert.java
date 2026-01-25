package com.ticketkatum.sos.entity;

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
@Table(name = "emergency_alerts", indexes = {
        @Index(name = "idx_ea_sos_user", columnList = "user_id"),
        @Index(name = "idx_ea_sos_status", columnList = "status"),
        @Index(name = "idx_ea_sos_triggered_at", columnList = "triggered_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AlertStatus status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(name = "signal_strength", length = 20)
    private String signalStrength;

    @CreatedDate
    @Column(name = "triggered_at", nullable = false, updatable = false)
    private LocalDateTime triggeredAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    public enum AlertStatus {
        TRIGGERED,
        ACKNOWLEDGED,
        RESOLVED,
        FALSE_ALARM
    }
}
