package com.ticketkatum.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_pricing",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"room_id", "rent_type_id", "meal_plan_id", "effective_from"}
        ),
        indexes = {
                @Index(name = "idx_pricing_lookup", columnList = "room_id,rent_type_id,meal_plan_id,effective_from")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rent_type_id", nullable = false)
    private RentType rentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal mealAddonCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Column(length = 50)
    private String season; // Peak, Regular, Off-Peak

    @Builder.Default
    private Boolean isActive = true;

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

