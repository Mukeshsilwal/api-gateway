package com.ticketkatum.repository;

import com.ticketkatum.entity.EventBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Event Booking Repository
 */
@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Long> {

    Optional<EventBooking> findByBookingReference(String bookingReference);

    Page<EventBooking> findByUserId(Long userId, Pageable pageable);

    Page<EventBooking> findByEventId(Long eventId, Pageable pageable);

    boolean existsByBookingReference(String bookingReference);
}
