package com.ticketkatum.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "service_source")
    private String serviceSource;

    @Column(name = "severity")
    private String severity; // INFO, WARNING, ERROR, CRITICAL

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
