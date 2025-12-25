package com.ticketkatum.trackingservice.entity;

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
@Table(name = "points_of_interest", indexes = {
        @Index(name = "idx_category", columnList = "category"),
        @Index(name = "idx_region", columnList = "region"),
        @Index(name = "idx_location", columnList = "latitude,longitude"),
        @Index(name = "idx_tourist_type", columnList = "tourist_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "poi_id")
    private Long poiId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private POICategory category;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "opening_hours")
    private String openingHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "tourist_type")
    private TouristType touristType = TouristType.ALL;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum POICategory {
        ATM,
        HOSPITAL,
        POLICE,
        FUEL,
        RESTAURANT,
        CULTURAL,
        EMERGENCY,
        HOTEL,
        TRANSPORT,
        SHOPPING
    }

    public enum TouristType {
        ALL,
        NEPALI,
        INTERNATIONAL
    }

    // Helper methods
    public double getLatitudeAsDouble() {
        return latitude != null ? latitude.doubleValue() : 0.0;
    }

    public double getLongitudeAsDouble() {
        return longitude != null ? longitude.doubleValue() : 0.0;
    }
}
