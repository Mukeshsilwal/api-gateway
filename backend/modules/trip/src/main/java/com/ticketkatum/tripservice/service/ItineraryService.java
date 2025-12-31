package com.ticketkatum.tripservice.service;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.repository.ItineraryDayRepository;
import com.ticketkatum.tripservice.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryDayRepository itineraryDayRepository;
    private final TripRepository tripRepository;

    @Transactional
    public ItineraryDay ensureDayForDate(Long tripId, LocalDate date) {
        Optional<ItineraryDay> existing = itineraryDayRepository.findByTrip_TripIdAndDate(tripId, date);
        if (existing.isPresent()) {
            return existing.get();
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        // Calculate day number
        int dayNumber = 1;
        if (trip.getStartDate() != null) {
            dayNumber = (int) java.time.temporal.ChronoUnit.DAYS.between(trip.getStartDate(), date) + 1;
        }

        ItineraryDay newDay = ItineraryDay.builder()
                .trip(trip)
                .date(date)
                .dayNumber(dayNumber)
                .title("Day " + dayNumber)
                .build();

        return itineraryDayRepository.save(newDay);
    }
}
