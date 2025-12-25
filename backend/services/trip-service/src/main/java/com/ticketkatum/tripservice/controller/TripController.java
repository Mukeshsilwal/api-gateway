package com.ticketkatum.tripservice.controller;

import com.ticketkatum.tripservice.dto.TripDTO;
import com.ticketkatum.tripservice.dto.request.CreateTripRequest;
import com.ticketkatum.tripservice.dto.request.UpdateTripRequest;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Trip Management", description = "APIs for managing tourist trips")
public class TripController {

    private final TripService tripService;

    @PostMapping
    @Operation(summary = "Create a new trip", description = "Creates a new trip for the authenticated user")
    public ResponseEntity<TripDTO> createTrip(
            @Valid @RequestBody CreateTripRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            Authentication authentication) {
        
        // Use userId from header (BFF) or extract from authentication (direct call)
        if (userId == null) {
            userId = extractUserId(authentication);
        }
        
        log.info("Creating trip for user: {}", userId);
        
        TripDTO trip = tripService.createTrip(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(trip);
    }

    @GetMapping("/{tripId}")
    @Operation(summary = "Get trip by ID", description = "Retrieves trip details by trip ID")
    public ResponseEntity<TripDTO> getTripById(@PathVariable("tripId") Long tripId) {
        log.info("Fetching trip: {}", tripId);
        TripDTO trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(trip);
    }

    @GetMapping("/{tripId}/details")
    @Operation(summary = "Get trip with full details", description = "Retrieves trip with checkpoints, bookings, and participants")
    public ResponseEntity<TripDTO> getTripWithDetails(@PathVariable("tripId") Long tripId) {
        log.info("Fetching trip with details: {}", tripId);
        TripDTO trip = tripService.getTripWithDetails(tripId);
        return ResponseEntity.ok(trip);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user trips", description = "Retrieves all trips for a specific user")
    public ResponseEntity<List<TripDTO>> getUserTrips(@PathVariable("userId") Long userId) {
        log.info("Fetching trips for user: {}", userId);
        List<TripDTO> trips = tripService.getUserTrips(userId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/my-trips")
    @Operation(summary = "Get my trips", description = "Retrieves all trips for the authenticated user")
    public ResponseEntity<List<TripDTO>> getMyTrips(Authentication authentication) {
        Long userId = extractUserId(authentication);
        log.info("Fetching trips for authenticated user: {}", userId);
        List<TripDTO> trips = tripService.getUserTrips(userId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/my-trips/status/{status}")
    @Operation(summary = "Get my trips by status", description = "Retrieves trips for authenticated user filtered by status")
    public ResponseEntity<List<TripDTO>> getMyTripsByStatus(
            @PathVariable ("status") Trip.TripStatus status,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        log.info("Fetching trips for user: {} with status: {}", userId, status);
        List<TripDTO> trips = tripService.getUserTripsByStatus(userId, status);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active trips", description = "Retrieves all currently active trips")
    public ResponseEntity<List<TripDTO>> getActiveTrips() {
        log.info("Fetching active trips");
        List<TripDTO> trips = tripService.getActiveTrips();
        return ResponseEntity.ok(trips);
    }

    @PutMapping("/{tripId}")
    @Operation(summary = "Update trip", description = "Updates trip details")
    public ResponseEntity<TripDTO> updateTrip(
            @PathVariable("tripId") Long tripId,
            @Valid @RequestBody UpdateTripRequest request) {
        
        log.info("Updating trip: {}", tripId);
        TripDTO trip = tripService.updateTrip(tripId, request);
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{tripId}/status")
    @Operation(summary = "Update trip status", description = "Updates the status of a trip")
    public ResponseEntity<TripDTO> updateTripStatus(
            @PathVariable("tripId") Long tripId,
            @RequestParam Trip.TripStatus status) {
        
        log.info("Updating trip status: {} to {}", tripId, status);
        TripDTO trip = tripService.updateTripStatus(tripId, status);
        return ResponseEntity.ok(trip);
    }

    @DeleteMapping("/{tripId}")
    @Operation(summary = "Cancel trip", description = "Cancels a trip (soft delete)")
    public ResponseEntity<Void> deleteTrip(@PathVariable("tripId") Long tripId) {
        log.info("Cancelling trip: {}", tripId);
        tripService.deleteTrip(tripId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/bookings")
    @Operation(summary = "Add booking to trip", description = "Associates a booking with a trip")
    public ResponseEntity<Void> addBookingToTrip(
            @PathVariable("tripId") Long tripId,
            @RequestBody java.util.Map<String, Object> bookingRequest) {
        
        log.info("Adding booking to trip: {}", tripId);
        tripService.addBookingToTrip(tripId, bookingRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{tripId}/bookings")
    @Operation(summary = "Get trip bookings", description = "Retrieves all bookings for a trip")
    public ResponseEntity<List<java.util.Map<String, Object>>> getTripBookings(@PathVariable("tripId") Long tripId) {
        log.info("Fetching bookings for trip: {}", tripId);
        List<java.util.Map<String, Object>> bookings = tripService.getTripBookings(tripId);
        return ResponseEntity.ok(bookings);
    }

    private Long extractUserId(Authentication authentication) {
        // TODO: Extract user ID from JWT token
        // For now, return a placeholder
        if (authentication != null && authentication.getPrincipal() != null) {
            // This would typically extract from JWT claims
            return 1L; // Placeholder
        }
        throw new RuntimeException("User not authenticated");
    }
}
