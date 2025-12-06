package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "plane_booking")
@Getter
@Setter
public class PlaneTicketBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String airlineName;
    private String flightNumber;
    private String seatClass;
    private String departure;
    private String arrival;

    @OneToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
}

