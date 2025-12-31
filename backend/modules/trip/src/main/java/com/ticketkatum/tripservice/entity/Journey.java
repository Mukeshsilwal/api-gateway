package com.ticketkatum.tripservice.entity;

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
import java.util.Map;

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

    // Use ManyToOne for direct relationship in the same service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private JourneyStatus status = JourneyStatus.DRAFT;

    // Direct relationship to ItineraryDay
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_day_id")
    private ItineraryDay itineraryDay;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "booking_reference", columnDefinition = "jsonb")
    private Map<String, Object> bookingReference;

    @Column(name = "total_estimated_cost", precision = 12, scale = 2)
    private BigDecimal totalEstimatedCost;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum JourneyStatus {
        DRAFT,
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
