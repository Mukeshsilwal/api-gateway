package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "crowd_zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrowdZone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String zoneName; // e.g., "North Gate"

    private int capacity;

    private int currentOccupancy;

    @Enumerated(EnumType.STRING)
    private ZoneStatus status;

    public void updateStatus() {
        if (capacity == 0) return;
        double ratio = (double) currentOccupancy / capacity;
        if (ratio >= 0.95) {
            this.status = ZoneStatus.RED;
        } else if (ratio >= 0.80) {
            this.status = ZoneStatus.YELLOW;
        } else {
            this.status = ZoneStatus.GREEN;
        }
    }
}
