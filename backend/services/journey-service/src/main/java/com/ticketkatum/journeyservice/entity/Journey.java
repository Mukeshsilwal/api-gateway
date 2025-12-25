package com.ticketkatum.journeyservice.entity;

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
@Table(name = "journeys")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Journey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "journey_id")
    private Long journeyId;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private JourneyStatus status = JourneyStatus.DRAFT;

    @Column(name = "optimization_score", precision = 5, scale = 2)
    private BigDecimal optimizationScore;

    @Column(name = "total_distance_km", precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;

    @Column(name = "estimated_duration_hours", precision = 10, scale = 2)
    private BigDecimal estimatedDurationHours;

    @Column(name = "total_estimated_cost", precision = 12, scale = 2)
    private BigDecimal totalEstimatedCost;

    @OneToMany(mappedBy = "journey", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<JourneySegment> segments = new ArrayList<>();

    @OneToMany(mappedBy = "journey", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JourneySuggestion> suggestions = new ArrayList<>();

    @OneToMany(mappedBy = "journey", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<JourneyWaypoint> waypoints = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void addSegment(JourneySegment segment) {
        segments.add(segment);
        segment.setJourney(this);
    }

    public void removeSegment(JourneySegment segment) {
        segments.remove(segment);
        segment.setJourney(null);
    }

    public void addSuggestion(JourneySuggestion suggestion) {
        suggestions.add(suggestion);
        suggestion.setJourney(this);
    }

    public void addWaypoint(JourneyWaypoint waypoint) {
        waypoints.add(waypoint);
        waypoint.setJourney(this);
    }

    // Enums
    public enum JourneyStatus {
        DRAFT,
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
