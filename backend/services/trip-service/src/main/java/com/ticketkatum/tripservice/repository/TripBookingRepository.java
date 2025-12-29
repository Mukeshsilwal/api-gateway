package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.TripBooking;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Trip Booking Repository
 * 
 * Performance Optimizations:
 * - Added JOIN FETCH queries to prevent N+1 queries
 * - Added native queries for complex aggregations
 */
@Repository
public interface TripBookingRepository extends JpaRepository<TripBooking, Long> {

    // ========== EXISTING METHODS (Unchanged for backward compatibility) ==========

    List<TripBooking> findByTripTripId(Long tripId);

    List<TripBooking> findByTripTripIdAndBookingType(Long tripId, TripBooking.BookingType bookingType);

    Optional<TripBooking> findByBookingTypeAndBookingId(TripBooking.BookingType bookingType, Long bookingId);

    @Query("SELECT tb FROM TripBooking tb WHERE tb.trip.userId = :userId")
    List<TripBooking> findByUserId(@Param("userId") Long userId);

    boolean existsByBookingTypeAndBookingId(TripBooking.BookingType bookingType, Long bookingId);

    // ========== OPTIMIZED METHODS (New - eliminates N+1 queries) ==========

    /**
     * Find trip bookings with eager loading of trip details
     * Prevents N+1 query when accessing trip information
     */
    @Query("""
                SELECT DISTINCT tb FROM TripBooking tb
                LEFT JOIN FETCH tb.trip t
                WHERE tb.trip.tripId = :tripId
                ORDER BY tb.createdAt DESC
            """)
    List<TripBooking> findByTripTripIdOptimized(@Param("tripId") Long tripId);

    /**
     * Find user's trip bookings with trip details
     * Optimized for user dashboard showing all their trip bookings
     */
    @Query("""
                SELECT DISTINCT tb FROM TripBooking tb
                LEFT JOIN FETCH tb.trip t
                WHERE tb.trip.userId = :userId
                ORDER BY tb.createdAt DESC
            """)
    List<TripBooking> findByUserIdOptimized(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find trip bookings by type with trip details
     */
    @Query("""
                SELECT DISTINCT tb FROM TripBooking tb
                LEFT JOIN FETCH tb.trip t
                WHERE tb.trip.tripId = :tripId
                  AND tb.bookingType = :bookingType
                ORDER BY tb.createdAt DESC
            """)
    List<TripBooking> findByTripTripIdAndBookingTypeOptimized(
            @Param("tripId") Long tripId,
            @Param("bookingType") TripBooking.BookingType bookingType);

    /**
     * Get aggregated trip booking details (native query for performance)
     * Returns all booking information in a single query
     * Result columns: id, booking_type, booking_id, booking_reference,
     * booking_date, amount, status, details
     */
    @Query(value = """
                SELECT
                    tb.id,
                    tb.booking_type,
                    tb.booking_id,
                    tb.booking_reference,
                    tb.booking_date,
                    tb.amount,
                    tb.status,
                    tb.details,
                    tb.created_at
                FROM trip_bookings tb
                WHERE tb.trip_id = :tripId
                ORDER BY tb.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findTripBookingDetails(@Param("tripId") Long tripId);

    /**
     * Count trip bookings by user (for pagination)
     */
    @Query("SELECT COUNT(tb) FROM TripBooking tb WHERE tb.trip.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Count trip bookings by trip ID
     */
    @Query("SELECT COUNT(tb) FROM TripBooking tb WHERE tb.trip.tripId = :tripId")
    long countByTripTripId(@Param("tripId") Long tripId);
}
