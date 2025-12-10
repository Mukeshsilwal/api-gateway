package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "movie_booking")
@Getter
@Setter
public class MovieBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cinemaHall;
    private String movieName;
    private String showTime;
    private String seatNumber;

    @OneToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
}
