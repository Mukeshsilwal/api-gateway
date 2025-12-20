package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Venue Entity
 * Represents physical event locations
 */
@Entity
@Table(name = "venues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "address", columnDefinition = "jsonb", nullable = false)
    private String address; // JSON: {street, city, state, country, postalCode}

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "amenities", columnDefinition = "jsonb")
    private String amenities; // JSON array

    @Column(name = "parking_info", columnDefinition = "TEXT")
    private String parkingInfo;

    @Column(name = "accessibility_info", columnDefinition = "TEXT")
    private String accessibilityInfo;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
