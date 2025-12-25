package com.ticketkatum.controller;

import com.ticketkatum.model.CompositeBookingRequest;
import com.ticketkatum.model.UnifiedBookingResponse;
import com.ticketkatum.service.BookingOrchestrator;
import com.ticketkatum.service.TripBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class TripBookingController {

    private final BookingOrchestrator bookingOrchestrator;
    private final TripBookingService tripBookingService;

    @PostMapping("/trip/{tripId}")
    public ResponseEntity<UnifiedBookingResponse> createBookingForTrip(
            @PathVariable Long tripId,
            @RequestBody CompositeBookingRequest request) {

        log.info("Creating booking for trip: {}", tripId);

        // Set tripId in request
        request.setTripId(tripId);

        // Process unified booking (will auto-associate with trip)
        UnifiedBookingResponse response = bookingOrchestrator.processUnifiedBooking(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/trip/{tripId}")
    public Mono<ResponseEntity<Map<String, Object>>> getTripBookings(@PathVariable Long tripId) {
        log.info("Fetching bookings for trip: {}", tripId);

        return tripBookingService.getTripBookings(tripId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
