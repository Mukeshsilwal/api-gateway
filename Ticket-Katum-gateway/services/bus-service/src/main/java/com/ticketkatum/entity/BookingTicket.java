package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "booking_ticket")
public class BookingTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String fullName;
    private String email;

    @OneToMany(mappedBy = "bookingTicket",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Ticket> tickets;

    private LocalDateTime bookingTime;
}
