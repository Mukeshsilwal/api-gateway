package com.ticketkatum.timelineservice.entity;

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
@Table(name = "checkpoints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Checkpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checkpoint_id")
    private Long checkpointId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timeline_id", nullable = false)
    private Timeline timeline;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkpoint_type", nullable = false, length = 50)
    private CheckpointType checkpointType;

    @Column(name = "location_name", nullable = false)
    private String locationName;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "actual_time")
    private LocalDateTime actualTime;

    @Column(name = "estimated_arrival_time")
    private LocalDateTime estimatedArrivalTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private CheckpointStatus status = CheckpointStatus.PENDING;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reminder_sent")
    @Builder.Default
    private Boolean reminderSent = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Enums
    public enum CheckpointType {
        DEPARTURE,
        ARRIVAL,
        ACTIVITY,
        MEAL,
        REST,
        TRANSIT,
        CUSTOM
    }

    public enum CheckpointStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED,
        DELAYED,
        CANCELLED
    }

    // Helper methods
    public void markAsReached() {
        this.status = CheckpointStatus.COMPLETED;
        this.actualTime = LocalDateTime.now();
    }

    public void markAsSkipped() {
        this.status = CheckpointStatus.SKIPPED;
    }

    public void markAsDelayed() {
        this.status = CheckpointStatus.DELAYED;
    }

    public void updateETA(LocalDateTime newETA) {
        this.estimatedArrivalTime = newETA;
    }

    public boolean isCompleted() {
        return status == CheckpointStatus.COMPLETED;
    }

    public boolean isPending() {
        return status == CheckpointStatus.PENDING;
    }

    public boolean isDelayed() {
        if (estimatedArrivalTime != null && scheduledTime != null) {
            return estimatedArrivalTime.isAfter(scheduledTime);
        }
        return false;
    }

    public long getDelayMinutes() {
        if (estimatedArrivalTime != null && scheduledTime != null) {
            return java.time.Duration.between(scheduledTime, estimatedArrivalTime).toMinutes();
        }
        return 0;
    }
}
