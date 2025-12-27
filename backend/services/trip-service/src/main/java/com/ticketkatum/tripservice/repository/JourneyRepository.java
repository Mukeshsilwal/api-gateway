package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    List<Journey> findByTrip_TripId(Long tripId);
}
