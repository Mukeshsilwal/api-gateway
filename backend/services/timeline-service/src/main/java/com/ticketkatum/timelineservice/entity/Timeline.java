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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timelines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Timeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "timeline_id")
    private Long timelineId;

    @Column(name = "journey_id", nullable = false, unique = true)
    private Long journeyId;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "current_checkpoint_id")
    private Long currentCheckpointId;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Column(name = "is_on_schedule")
    @Builder.Default
    private Boolean isOnSchedule = true;

    @Column(name = "delay_minutes")
    @Builder.Default
    private Integer delayMinutes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private TimelineStatus status = TimelineStatus.PENDING;

    @OneToMany(mappedBy = "timeline", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Checkpoint> checkpoints = new ArrayList<>();

    @OneToMany(mappedBy = "timeline", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimelineEvent> events = new ArrayList<>();

    @OneToMany(mappedBy = "timeline", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Delay> delays = new ArrayList<>();

    @OneToMany(mappedBy = "timeline", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimelineNotification> notifications = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    // Enums
    public enum TimelineStatus {
        PENDING,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    // Helper methods
    public void addCheckpoint(Checkpoint checkpoint) {
        checkpoints.add(checkpoint);
        checkpoint.setTimeline(this);
    }

    public void removeCheckpoint(Checkpoint checkpoint) {
        checkpoints.remove(checkpoint);
        checkpoint.setTimeline(null);
    }

    public void addEvent(TimelineEvent event) {
        events.add(event);
        event.setTimeline(this);
    }

    public void addDelay(Delay delay) {
        delays.add(delay);
        delay.setTimeline(this);
    }

    public void addNotification(TimelineNotification notification) {
        notifications.add(notification);
        notification.setTimeline(this);
    }

    public void updateProgress(BigDecimal newProgress) {
        this.progressPercentage = newProgress;
    }

    public void updateStatus(TimelineStatus newStatus) {
        this.status = newStatus;
        addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.valueOf("STATUS_CHANGED_TO_" + newStatus))
                .description("Timeline status changed to " + newStatus)
                .build());
    }

    public boolean isActive() {
        return status == TimelineStatus.ACTIVE;
    }

    public boolean isCompleted() {
        return status == TimelineStatus.COMPLETED;
    }
}
