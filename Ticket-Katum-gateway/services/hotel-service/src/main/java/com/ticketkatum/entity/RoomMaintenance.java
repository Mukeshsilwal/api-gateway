package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "room_maintenance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Current room state: Available, Under Maintenance, Blocked etc.
    private String roomStatus;

    // Cleaning: Pending, InProgress, Done
    private String cleaningStatus;

    // Maintenance: None, Required, InProgress, Completed
    private String maintenanceStatus;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "room_amenity_status", joinColumns = @JoinColumn(name = "maintenance_id"))
    @MapKeyColumn(name = "amenity_name")
    @Column(name = "status")
    private Map<String, Boolean> amenitiesStatus = new HashMap<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "room_maintenance_suggestions", joinColumns = @JoinColumn(name = "maintenance_id"))
    @Column(name = "suggestion")
    private List<String> suggestions = new ArrayList<>();

    // Assign staff name / staff id
    private String assignedStaff;

    // Tracking
    private LocalDateTime lastUpdated;

    // Relationship with room
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}

