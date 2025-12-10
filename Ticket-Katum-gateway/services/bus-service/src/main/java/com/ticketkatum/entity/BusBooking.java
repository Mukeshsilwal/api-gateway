package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "bus_booking")
@Getter
@Setter
public class BusBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String busName;
    private String seatNo;
    private String route;
    private String departureTime;

    @OneToOne
    @JoinColumn(name = "booking_id")
    private BookingTicket booking;
}
