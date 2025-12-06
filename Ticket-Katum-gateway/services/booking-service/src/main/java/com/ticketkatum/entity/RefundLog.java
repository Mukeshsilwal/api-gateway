package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_log")
@Getter
@Setter
public class RefundLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String refundReference;
    private Double refundAmount;
    private String reason;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private LocalDateTime refundedAt = LocalDateTime.now();
}

