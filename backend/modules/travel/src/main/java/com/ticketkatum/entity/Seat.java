package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private com.ticketkatum.enums.SeatStatus status;

    private java.time.LocalDateTime holdExpiresAt;

    private Long holdByUserId;

    private BigDecimal price;
    private boolean isReserved;

    private String seatNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @OneToOne(mappedBy = "seat", fetch = FetchType.LAZY)
    private Ticket ticket;
}
