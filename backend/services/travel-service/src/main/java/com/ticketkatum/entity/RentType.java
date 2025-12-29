package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rent_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name; // Hourly, Daily, Weekly

    @Column(unique = true, nullable = false, length = 20)
    private String code; // HOURLY, DAILY, WEEKLY

    @Column(nullable = false)
    private Integer durationHours; // 1, 24, 168

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
