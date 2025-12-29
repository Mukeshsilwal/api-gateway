package com.ticketkatum.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Hotel entity with optimistic locking and soft delete support
 */
@Entity
@Table(name = "hotels", indexes = {
                @Index(name = "idx_hotel_code", columnList = "hotelCode"),
                @Index(name = "idx_hotel_name", columnList = "name"),
                @Index(name = "idx_hotel_city", columnList = "city"),
                @Index(name = "idx_hotel_deleted", columnList = "deleted")
})
@SQLDelete(sql = "UPDATE hotels SET deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?")
@Where(clause = "deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true)
        private String hotelCode;

        @Column(nullable = false)
        private String name;

        @Column(columnDefinition = "TEXT")
        private String description;

        private String address;
        private String city;
        private String country;
        private String phone;
        private String email;
        private String zipCode;

        @Column(nullable = false)
        private Double latitude;

        @Column(nullable = false)
        private Double longitude;

        private Integer stars;
        private Double rating;
        private Integer starRating;

        @Column(columnDefinition = "TEXT")
        private String amenities;

        private String website;

        @ElementCollection(fetch = FetchType.LAZY)
        @CollectionTable(name = "hotel_images", joinColumns = @JoinColumn(name = "hotel_id"))
        @Column(name = "url")
        @Builder.Default
        private Set<String> images = new HashSet<>();

        @Column(precision = 10, scale = 2)
        private BigDecimal minPrice;

        @Column(precision = 10, scale = 2)
        private BigDecimal maxPrice;

        private Double averageRating;

        private Integer totalReviews;

        private Boolean active = true;
        private Boolean featured = false;

        @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        @JsonIgnore
        @Builder.Default
        private List<Room> rooms = new ArrayList<>();

        // Soft delete flag
        @Column(nullable = false)
        @Builder.Default
        private Boolean deleted = false;

        // Optimistic locking
        @Version
        @Column(nullable = false)
        private Integer version;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        @PrePersist
        private void onCreate() {
                this.createdAt = LocalDateTime.now();
                this.updatedAt = LocalDateTime.now();
                if (this.deleted == null) {
                        this.deleted = false;
                }
        }

        @PreUpdate
        private void onUpdate() {
                this.updatedAt = LocalDateTime.now();
        }

        public double distanceFrom(Double fromLatitude, Double fromLongitude) {
                if (this.latitude == null || this.longitude == null ||
                                fromLatitude == null || fromLongitude == null) {
                        return Double.MAX_VALUE;
                }

                final int EARTH_RADIUS_KM = 6371;
                double latDistance = Math.toRadians(fromLatitude - this.latitude);
                double lonDistance = Math.toRadians(fromLongitude - this.longitude);

                double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                                + Math.cos(Math.toRadians(this.latitude))
                                                * Math.cos(Math.toRadians(fromLatitude))
                                                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return EARTH_RADIUS_KM * c;
        }
}
