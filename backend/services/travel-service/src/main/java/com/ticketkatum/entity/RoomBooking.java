package com.ticketkatum.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ticketkatum.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * RoomBooking entity with optimistic locking to prevent double-booking
 */
@Entity
@Table(name = "room_bookings", indexes = {
        @Index(name = "idx_booking_reference", columnList = "bookingReference"),
        @Index(name = "idx_room_dates", columnList = "room_id,checkIn,checkOut"),
        @Index(name = "idx_customer", columnList = "customerId"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_check_in", columnList = "checkIn")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private Room room;

    @Column(nullable = false)
    private Long customerId; // Reference to User/Customer entity

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rent_type_id", nullable = false)
    private RentType rentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @Column(nullable = false)
    private LocalDateTime checkIn;

    @Column(nullable = false)
    private LocalDateTime checkOut;

    @Column(nullable = false)
    private Integer numberOfUnits; // Number of hours/days/weeks

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal mealCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false)
    private Integer guestsCount;

    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    // Additional booking metadata
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Optimistic locking - critical for preventing double-booking
    @Version
    @Column(nullable = false)
    private Integer version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
