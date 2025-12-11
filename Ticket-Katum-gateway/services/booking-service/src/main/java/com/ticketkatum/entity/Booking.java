package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerId;
    @Column(nullable = false)
    private String category; // BUS, PLANE, CINEMA, HOTEL

    @Column(nullable = false)
    private String providerName; // qfx, iplex, himchuli, etc.

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status;

    private String providerBookingId;
    private String providerTransactionId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}