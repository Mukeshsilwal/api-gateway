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
@Table(name = "sos_triggers", indexes = {
        @Index(name = "idx_st_sos_user", columnList = "user_id"),
        @Index(name = "idx_st_sos_trip", columnList = "trip_id"),
        @Index(name = "idx_st_sos_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SOSTrigger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sos_id")
    private Long sosId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "latitude", precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SOSStatus status = SOSStatus.ACTIVE;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "last_heartbeat")
    private LocalDateTime lastHeartbeat;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    public enum SOSStatus {
        ACTIVE,
        ESCALATED,
        RESOLVED,
        FALSE_ALARM
    }
}
