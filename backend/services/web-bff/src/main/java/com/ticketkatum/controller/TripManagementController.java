package com.ticketkatum.controller;

import com.ticketkatum.service.TripManagementService;
import com.ticketkatum.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/bff/trips")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Trip Management BFF", description = "BFF endpoints for trip management")
public class TripManagementController {

    private final TripManagementService tripManagementService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @Operation(summary = "Create trip", description = "Create a new trip via BFF")
    public Mono<ResponseEntity<Map>> createTrip(
            @RequestBody Map<String, Object> tripRequest,
            HttpServletRequest request) {

        // Extract userId from JWT token
        Long userId = extractUserIdFromRequest(request);

        log.info("BFF: Creating trip for user: {}", userId);

        return tripManagementService.createTrip(userId, tripRequest)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    private Long extractUserIdFromRequest(HttpServletRequest request) {
        log.debug("Attempting to extract userId from request");

        // First try to get from request attribute (set by JwtAuthenticationFilter)
        Object userIdAttr = request.getAttribute("userId");
        log.debug("Request attribute 'userId': {}", userIdAttr);

        if (userIdAttr != null) {
            log.debug("Found userId in request attributes, type: {}", userIdAttr.getClass().getName());
            if (userIdAttr instanceof Integer) {
                Long userId = ((Integer) userIdAttr).longValue();
                log.info("Extracted userId from attribute (Integer): {}", userId);
                return userId;
            } else if (userIdAttr instanceof Long) {
                log.info("Extracted userId from attribute (Long): {}", userIdAttr);
                return (Long) userIdAttr;
            } else if (userIdAttr instanceof String) {
                try {
                    Long userId = Long.parseLong((String) userIdAttr);
                    log.info("Extracted userId from attribute (String): {}", userId);
                    return userId;
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse userId from attribute: {}", userIdAttr);
                }
            } else {
                log.warn("userId attribute has unexpected type: {}", userIdAttr.getClass().getName());
            }
        }

        // Fallback: Extract from Authorization header
        String authHeader = request.getHeader("Authorization");
        log.debug("Authorization header present: {}", authHeader != null);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("Attempting to extract userId from JWT token");
            Long userId = jwtUtil.extractUserIdFromToken(authHeader);
            if (userId != null) {
                log.info("Extracted userId from JWT token: {}", userId);
                return userId;
            }
        }

        log.warn("Could not extract userId from request - no attribute and no valid token");
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/{tripId}")
    @Operation(summary = "Get trip", description = "Get trip by ID via BFF")
    public Mono<ResponseEntity<Map>> getTripById(@PathVariable("tripId") Long tripId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Fetching trip: {} for user: {}", tripId, userId);
        return tripManagementService.getTripById(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{tripId}/details")
    @Operation(summary = "Get trip details", description = "Get trip details with checkpoints via BFF")
    public Mono<ResponseEntity<Map>> getTripDetails(@PathVariable("tripId") Long tripId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Fetching trip details: {} for user: {}", tripId, userId);
        return tripManagementService.getTripDetails(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{tripId}/itinerary")
    @Operation(summary = "Get trip full itinerary", description = "Get trip details with bookings and journeys aggregated via BFF")
    public Mono<ResponseEntity<Map>> getTripFullItinerary(@PathVariable("tripId") Long tripId,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Fetching trip full itinerary: {} for user: {}", tripId, userId);
        return tripManagementService.getTripFullItinerary(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{tripId}")
    @Operation(summary = "Update trip", description = "Update trip details via BFF")
    public Mono<ResponseEntity<Map>> updateTrip(
            @PathVariable("tripId") Long tripId,
            @RequestBody Map<String, Object> updateRequest,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Updating trip: {} for user: {}", tripId, userId);
        return tripManagementService.updateTrip(tripId, updateRequest, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{tripId}/status")
    @Operation(summary = "Update trip status", description = "Update trip status via BFF")
    public Mono<ResponseEntity<Map>> updateTripStatus(
            @PathVariable("tripId") Long tripId,
            @RequestBody Map<String, Object> statusRequest,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Updating trip status: {} for user: {}", tripId, userId);
        String status = (String) statusRequest.get("status");
        return tripManagementService.updateTripStatus(tripId, status, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{tripId}")
    @Operation(summary = "Delete trip", description = "Delete trip via BFF")
    public Mono<ResponseEntity<Void>> deleteTrip(@PathVariable("tripId") Long tripId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Deleting trip: {} for user: {}", tripId, userId);
        return tripManagementService.deleteTrip(tripId, userId)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{tripId}/bookings")
    @Operation(summary = "Get trip bookings", description = "Get all bookings for a trip via BFF")
    public Flux<Map> getTripBookings(@PathVariable("tripId") Long tripId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Fetching bookings for trip: {} for user: {}", tripId, userId);
        return tripManagementService.getTripBookings(tripId, userId);
    }

    @PostMapping("/{tripId}/journeys/generate")
    @Operation(summary = "Generate journey", description = "Generate/initialize journey via BFF")
    public Mono<ResponseEntity<Map>> generateJourney(@PathVariable("tripId") Long tripId, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        log.info("BFF: Generating journey for trip: {} for user: {}", tripId, userId);
        return tripManagementService.generateJourney(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @PostMapping("/{tripId}/itinerary/initialize")
    @Operation(summary = "Initialize itinerary", description = "Initialize itinerary for a trip via BFF")
    public Mono<ResponseEntity<Void>> initializeItinerary(@PathVariable("tripId") Long tripId,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request); // Assuming userId might be needed for authorization/logging
        log.info("BFF: Initializing itinerary for trip: {} for user: {}", tripId, userId);
        return tripManagementService.initializeItinerary(tripId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .defaultIfEmpty(ResponseEntity.badRequest().build()); // Or appropriate error response
    }

    @PostMapping("/journeys/{journeyId}/checkpoints")
    @Operation(summary = "Add checkpoint", description = "Add checkpoint via BFF")
    public Mono<ResponseEntity<Map>> addCheckpoint(
            @PathVariable("journeyId") Long journeyId,
            @RequestBody Map<String, Object> checkpointRequest,
            HttpServletRequest request) {

        log.info("BFF: Adding checkpoint to journey: {}", journeyId);
        return tripManagementService.addCheckpoint(journeyId, checkpointRequest)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/journeys/{journeyId}/checkpoints/{checkpointId}")
    @Operation(summary = "Delete checkpoint", description = "Delete checkpoint via BFF")
    public Mono<ResponseEntity<Void>> deleteCheckpoint(
            @PathVariable("journeyId") Long journeyId,
            @PathVariable("checkpointId") Long checkpointId,
            HttpServletRequest request) {

        log.info("BFF: Deleting checkpoint: {} from journey: {}", checkpointId, journeyId);
        return tripManagementService.deleteCheckpoint(journeyId, checkpointId)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
