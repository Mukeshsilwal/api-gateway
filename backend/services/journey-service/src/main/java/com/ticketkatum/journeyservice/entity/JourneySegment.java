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

@Entity
@Table(name = "journey_segments")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneySegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "segment_id")
    private Long segmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "segment_type", nullable = false)
    private SegmentType segmentType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "location_from")
    private String locationFrom;

    @Column(name = "location_to")
    private String locationTo;

    @Column(name = "latitude_from", precision = 10, scale = 8)
    private BigDecimal latitudeFrom;

    @Column(name = "longitude_from", precision = 11, scale = 8)
    private BigDecimal longitudeFrom;

    @Column(name = "latitude_to", precision = 10, scale = 8)
    private BigDecimal latitudeTo;

    @Column(name = "longitude_to", precision = 11, scale = 8)
    private BigDecimal longitudeTo;

    @Column(name = "booking_reference", length = 100)
    private String bookingReference;

    @Column(name = "booking_type", length = 50)
    private String bookingType;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "actual_cost", precision = 10, scale = 2)
    private BigDecimal actualCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SegmentStatus status = SegmentStatus.PLANNED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Enums
    public enum SegmentType {
        TRAVEL,      // Bus, taxi, flight, etc.
        STAY,        // Hotel, resort, homestay
        ACTIVITY,    // Sightseeing, adventure, tours
        MEAL,        // Breakfast, lunch, dinner
        REST,        // Break, rest stop
        TRANSIT      // Transfer, waiting time
    }

    public enum SegmentStatus {
        PLANNED,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        SKIPPED
    }
}
