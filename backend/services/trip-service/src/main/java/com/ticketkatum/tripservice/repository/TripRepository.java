package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserId(Long userId);

    List<Trip> findByUserIdAndStatus(Long userId, Trip.TripStatus status);

    @Query("SELECT t FROM Trip t WHERE t.userId = :userId AND t.status IN :statuses ORDER BY t.startDate DESC")
    List<Trip> findByUserIdAndStatusIn(@Param("userId") Long userId, @Param("statuses") List<Trip.TripStatus> statuses);

    @Query("SELECT t FROM Trip t WHERE t.userId = :userId AND t.startDate >= :fromDate AND t.endDate <= :toDate")
    List<Trip> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT t FROM Trip t LEFT JOIN FETCH t.checkpoints WHERE t.tripId = :tripId")
    Optional<Trip> findByIdWithCheckpoints(@Param("tripId") Long tripId);

    @Query("SELECT t FROM Trip t LEFT JOIN FETCH t.bookings WHERE t.tripId = :tripId")
    Optional<Trip> findByIdWithBookings(@Param("tripId") Long tripId);

    // Fetch trip without eager loading collections to avoid MultipleBagFetchException
    // Collections will be loaded lazily or via separate queries
    @Query("SELECT t FROM Trip t WHERE t.tripId = :tripId")
    Optional<Trip> findByIdWithDetails(@Param("tripId") Long tripId);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.userId = :userId AND t.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Trip.TripStatus status);

    @Query("SELECT t FROM Trip t WHERE t.status = 'IN_PROGRESS' AND t.startDate <= :today AND t.endDate >= :today")
    List<Trip> findActiveTrips(@Param("today") LocalDate today);
}
