package com.ticketkatum.tripservice.controller;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import com.ticketkatum.tripservice.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/internal/itinerary-days")
@RequiredArgsConstructor
public class InternalItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/ensure")
    public ResponseEntity<ItineraryDay> ensureDayForDate(@RequestBody Map<String, Object> request) {
        Long tripId = ((Number) request.get("tripId")).longValue();
        LocalDate date = LocalDate.parse((String) request.get("date"));

        ItineraryDay day = itineraryService.ensureDayForDate(tripId, date);
        return ResponseEntity.ok(day);
    }
}
