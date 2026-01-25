package com.ticketkatum.repository;

import com.ticketkatum.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

@org.springframework.stereotype.Repository
public interface BookingRepo extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(String customerId);

    java.util.Optional<Booking> findByProviderBookingId(String providerBookingId);
}
