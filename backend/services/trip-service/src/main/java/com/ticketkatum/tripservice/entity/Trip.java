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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "trip_name", nullable = false)
    private String tripName;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", nullable = false)
    private TripType tripType = TripType.LEISURE;

    @Enumerated(EnumType.STRING)
    @Column(name = "tourist_type", nullable = false)
    private TouristType touristType = TouristType.NEPALI;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TripStatus status = TripStatus.PLANNED;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "budget", precision = 10, scale = 2)
    private BigDecimal budget;

    @Column(name = "actual_cost", precision = 10, scale = 2)
    private BigDecimal actualCost = BigDecimal.ZERO;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @Builder.Default
    private List<TripCheckpoint> checkpoints = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @Builder.Default
    private List<TripBooking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    @Builder.Default
    private List<TripParticipant> participants = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum TripType {
        LEISURE,        // Vacation, relaxation
        BUSINESS,       // Work-related travel
        ADVENTURE,      // Trekking, hiking, extreme sports
        CULTURAL,       // Heritage sites, museums
        PILGRIMAGE      // Religious sites
    }

    public enum TouristType {
        NEPALI,
        INTERNATIONAL
    }

    public enum TripStatus {
        PLANNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        PARTIAL_BOOKING // Should handle SAGA compensation scenarios
    }

    // Helper methods
    public void addCheckpoint(TripCheckpoint checkpoint) {
        checkpoints.add(checkpoint);
        checkpoint.setTrip(this);
    }

    public void removeCheckpoint(TripCheckpoint checkpoint) {
        checkpoints.remove(checkpoint);
        checkpoint.setTrip(null);
    }

    public void addBooking(TripBooking booking) {
        bookings.add(booking);
        booking.setTrip(this);
    }

    public void removeBooking(TripBooking booking) {
        bookings.remove(booking);
        booking.setTrip(null);
    }

    public void addParticipant(TripParticipant participant) {
        participants.add(participant);
        participant.setTrip(this);
    }

    public void removeParticipant(TripParticipant participant) {
        participants.remove(participant);
        participant.setTrip(null);
    }
}
