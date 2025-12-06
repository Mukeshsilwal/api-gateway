package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private boolean reserved;

    private BigDecimal price;

    private String seatNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @OneToOne(mappedBy = "seat", fetch = FetchType.LAZY)
    private Ticket ticket;
}
