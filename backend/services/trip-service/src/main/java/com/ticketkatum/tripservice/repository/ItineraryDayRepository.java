package com.ticketkatum.tripservice.repository;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByTrip_TripId(Long tripId);

    List<ItineraryDay> findByTrip_TripIdOrderByDayNumberAsc(Long tripId);

    java.util.Optional<ItineraryDay> findByTrip_TripIdAndDate(Long tripId, java.time.LocalDate date);
}
