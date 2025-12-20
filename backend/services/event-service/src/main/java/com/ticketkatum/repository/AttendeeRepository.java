package com.ticketkatum.repository;

import com.ticketkatum.entity.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Attendee Repository
 */
@Repository
public interface AttendeeRepository extends JpaRepository<Attendee, Long> {

    Optional<Attendee> findByQrCode(String qrCode);

    Optional<Attendee> findByTicketId(String ticketId);

    List<Attendee> findByBookingId(Long bookingId);

    @Query("SELECT a FROM Attendee a WHERE a.booking.event.id = :eventId")
    List<Attendee> findByEventId(Long eventId);

    @Query("SELECT COUNT(a) FROM Attendee a WHERE a.booking.event.id = :eventId AND a.checkInStatus = 'CHECKED_IN'")
    Long countCheckedInByEventId(Long eventId);
}
