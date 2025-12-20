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
 * Room entity with optimistic locking and soft delete support
 */
@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_room_type", columnList = "roomType"),
        @Index(name = "idx_room_hotel", columnList = "hotel_id"),
        @Index(name = "idx_room_deleted", columnList = "deleted")
})
@SQLDelete(sql = "UPDATE rooms SET deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND version = ?")
@Where(clause = "deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    private String roomType;
    private String description;
    private Integer capacity;
    private BigDecimal basePrice;
    private BigDecimal maxPrice;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    @Builder.Default
    private Set<String> amenities = new HashSet<>();

    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    @JsonIgnore
    private Hotel hotel;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<RoomMaintenance> maintenanceRecords = new ArrayList<>();

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
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (deleted == null) {
            deleted = false;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}