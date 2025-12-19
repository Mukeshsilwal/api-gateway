package com.ticketkatum.repository;

import com.ticketkatum.entity.BusBooking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusBookingRepo extends JpaRepository<BusBooking, Long> {

    BusBooking findByBookingId(Long bookingId);
}
