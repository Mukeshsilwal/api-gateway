package com.ticketkatum.repository;

import com.ticketkatum.entity.EventBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Event Booking Repository
 * 
 * Performance Optimizations:
 * - Added @EntityGraph methods to prevent N+1 queries
 * - Added JOIN FETCH queries for eager loading related entities
 * - Added count queries for efficient pagination
 */
@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Long> {

    // ========== EXISTING METHODS (Unchanged for backward compatibility) ==========

    Optional<EventBooking> findByBookingReference(String bookingReference);

    Page<EventBooking> findByUserId(Long userId, Pageable pageable);

    Page<EventBooking> findByEventId(Long eventId, Pageable pageable);

    boolean existsByBookingReference(String bookingReference);

    // ========== OPTIMIZED METHODS (New - eliminates N+1 queries) ==========

    /**
     * Find booking by reference with eager loading of event
     * Prevents N+1 query when accessing event details
     */
    @Query("SELECT eb FROM EventBooking eb WHERE eb.bookingReference = :bookingReference")
    @EntityGraph(attributePaths = { "event", "event.organizer" })
    Optional<EventBooking> findByBookingReferenceOptimized(@Param("bookingReference") String bookingReference);

    /**
     * Find user bookings with eager loading (for pagination)
     * Uses @EntityGraph to load event, organizer, and attendees in single query
     */
    @Query("SELECT eb FROM EventBooking eb WHERE eb.userId = :userId")
    @EntityGraph(attributePaths = { "event", "event.organizer", "attendees" })
    Page<EventBooking> findByUserIdOptimized(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find user bookings with full details using JOIN FETCH
     * Best for detailed views where all related data is needed
     * Note: Returns List instead of Page to avoid count query overhead
     */
    @Query("""
                SELECT DISTINCT eb FROM EventBooking eb
                LEFT JOIN FETCH eb.event e
                LEFT JOIN FETCH e.organizer
                LEFT JOIN FETCH eb.attendees
                WHERE eb.userId = :userId
                ORDER BY eb.createdAt DESC
            """)
    List<EventBooking> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    /**
     * Count user bookings (for manual pagination with findByUserIdWithDetails)
     */
    @Query("SELECT COUNT(eb) FROM EventBooking eb WHERE eb.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Find event bookings with eager loading
     * Optimized for event organizers viewing all bookings for their event
     */
    @Query("SELECT eb FROM EventBooking eb WHERE eb.event.id = :eventId")
    @EntityGraph(attributePaths = { "event", "attendees" })
    Page<EventBooking> findByEventIdOptimized(@Param("eventId") Long eventId, Pageable pageable);

    /**
     * Find bookings by event with full details
     */
    @Query("""
                SELECT DISTINCT eb FROM EventBooking eb
                LEFT JOIN FETCH eb.event e
                LEFT JOIN FETCH eb.attendees
                WHERE e.id = :eventId
                ORDER BY eb.createdAt DESC
            """)
    List<EventBooking> findByEventIdWithDetails(@Param("eventId") Long eventId, Pageable pageable);

    /**
     * Find bookings by status with event details
     * Useful for admin dashboards showing pending/confirmed bookings
     */
    @Query("""
                SELECT DISTINCT eb FROM EventBooking eb
                LEFT JOIN FETCH eb.event e
                WHERE eb.status = :status
                ORDER BY eb.createdAt DESC
            """)
    List<EventBooking> findByStatusWithEventDetails(@Param("status") EventBooking.BookingStatus status,
            Pageable pageable);
}
