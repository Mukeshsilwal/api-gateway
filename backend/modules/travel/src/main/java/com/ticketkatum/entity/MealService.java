package com.ticketkatum.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ticketkatum.enums.MealType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_services",
        indexes = {
                @Index(name = "idx_booking_meal", columnList = "booking_id,serviceDate")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private RoomBooking booking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    @Column(nullable = false)
    private LocalDate serviceDate;

    @Column(nullable = false)
    private Integer guestsCount;

    @Builder.Default
    private Boolean served = false;

    private LocalDateTime servedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
