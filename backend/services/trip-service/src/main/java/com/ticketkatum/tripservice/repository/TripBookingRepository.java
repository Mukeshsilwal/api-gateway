package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.TripBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripBookingRepository extends JpaRepository<TripBooking, Long> {

    List<TripBooking> findByTripTripId(Long tripId);

    List<TripBooking> findByTripTripIdAndBookingType(Long tripId, TripBooking.BookingType bookingType);

    Optional<TripBooking> findByBookingTypeAndBookingId(TripBooking.BookingType bookingType, Long bookingId);

    @Query("SELECT tb FROM TripBooking tb WHERE tb.trip.userId = :userId")
    List<TripBooking> findByUserId(@Param("userId") Long userId);

    boolean existsByBookingTypeAndBookingId(TripBooking.BookingType bookingType, Long bookingId);
}
