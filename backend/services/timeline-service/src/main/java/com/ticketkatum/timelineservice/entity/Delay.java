package com.ticketkatum.timelineservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "delays")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Delay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delay_id")
    private Long delayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeline_id", nullable = false)
    private Timeline timeline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkpoint_id")
    private Checkpoint checkpoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "delay_type", nullable = false, length = 50)
    private DelayType delayType;

    @Column(name = "delay_minutes", nullable = false)
    private Integer delayMinutes;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @CreatedDate
    @Column(name = "detected_at", nullable = false, updatable = false)
    private LocalDateTime detectedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false;

    // Enums
    public enum DelayType {
        TRAFFIC,
        WEATHER,
        BOOKING,
        PERSONAL,
        OTHER
    }

    // Helper methods
    public void resolve() {
        this.isResolved = true;
        this.resolvedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return !isResolved;
    }

    public long getDurationMinutes() {
        if (resolvedAt != null) {
            return java.time.Duration.between(detectedAt, resolvedAt).toMinutes();
        }
        return java.time.Duration.between(detectedAt, LocalDateTime.now()).toMinutes();
    }
}
