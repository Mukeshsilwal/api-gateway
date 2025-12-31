package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.TripCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripCheckpointRepository extends JpaRepository<TripCheckpoint, Long> {
    List<TripCheckpoint> findByTrip_TripId(Long tripId);

    List<TripCheckpoint> findByJourney_JourneyId(Long journeyId);
}
