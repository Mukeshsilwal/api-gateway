package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.TripCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripCheckpointRepository extends JpaRepository<TripCheckpoint, Long> {

    List<TripCheckpoint> findByTripTripIdOrderByScheduledTimeAsc(Long tripId);

    List<TripCheckpoint> findByTripTripIdAndStatus(Long tripId, TripCheckpoint.CheckpointStatus status);

    @Query("SELECT tc FROM TripCheckpoint tc WHERE tc.trip.tripId = :tripId AND tc.scheduledTime BETWEEN :start AND :end ORDER BY tc.scheduledTime")
    List<TripCheckpoint> findByTripIdAndTimeRange(@Param("tripId") Long tripId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT tc FROM TripCheckpoint tc WHERE tc.trip.tripId = :tripId AND tc.status = 'PENDING' AND tc.scheduledTime <= :time")
    List<TripCheckpoint> findUpcomingCheckpoints(@Param("tripId") Long tripId, @Param("time") LocalDateTime time);
}
