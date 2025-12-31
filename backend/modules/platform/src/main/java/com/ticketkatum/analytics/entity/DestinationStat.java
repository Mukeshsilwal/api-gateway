package com.ticketkatum.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "destination_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location_name", nullable = false, unique = true)
    private String locationName;

    @Column(name = "search_count")
    private Integer searchCount = 0;

    @Column(name = "booking_count")
    private Integer bookingCount = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
