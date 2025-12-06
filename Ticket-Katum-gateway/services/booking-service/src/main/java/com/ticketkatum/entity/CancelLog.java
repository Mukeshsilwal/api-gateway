package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cancel_log")
@Getter
@Setter
public class CancelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String cancelReason;
    private String providerResponse;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private LocalDateTime cancelledAt = LocalDateTime.now();
}
