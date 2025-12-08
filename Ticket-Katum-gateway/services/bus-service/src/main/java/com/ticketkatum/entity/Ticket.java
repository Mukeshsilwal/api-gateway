package com.ticketkatum.entity;

import com.ticketkatum.enums.Priority;
import com.ticketkatum.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketNo;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_ticket_id")
    private BookingTicket bookingTicket;
}
