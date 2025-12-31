package com.ticketkatum.controller;

import com.ticketkatum.service.TripAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import com.ticketkatum.util.JwtUtil;

@RestController
@RequestMapping("/api/bff/trips")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Trip Dashboard BFF", description = "Backend-for-Frontend trip aggregation APIs")
public class TripDashboardController {

    private final TripAggregationService tripAggregationService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{tripId}/dashboard")
    @Operation(summary = "Get trip dashboard", description = "Get comprehensive trip dashboard with all aggregated data")
    public Mono<ResponseEntity<Map<String, Object>>> getTripDashboard(@PathVariable("tripId") Long tripId,
            Authentication authentication, @RequestHeader(name = "Authorization", required = false) String token) {
        Long userId = extractUserId(authentication, token);
        log.info("Fetching trip dashboard for trip: {} for user: {}", tripId, userId);

        return tripAggregationService.getTripDashboard(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-trips")
    @Operation(summary = "Get my trips", description = "Get all trips for authenticated user with summary data")
    public Mono<ResponseEntity<List<Map<String, Object>>>> getMyTrips(Authentication authentication,
            @RequestHeader(name = "Authorization", required = false) String token) {
        Long userId = extractUserId(authentication, token);
        log.info("Fetching trips for user: {}", userId);

        return tripAggregationService.getUserTrips(userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user trips", description = "Get all trips for a specific user (admin)")
    public Mono<ResponseEntity<List<Map<String, Object>>>> getUserTrips(@PathVariable("userId") Long userId) {
        log.info("Fetching trips for user: {}", userId);

        return tripAggregationService.getUserTrips(userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{tripId}/timeline")
    @Operation(summary = "Get trip timeline", description = "Get aggregated timeline for a trip")
    public Mono<ResponseEntity<Map<String, Object>>> getTripTimeline(@PathVariable("tripId") Long tripId,
            Authentication authentication, @RequestHeader(name = "Authorization", required = false) String token) {
        Long userId = extractUserId(authentication, token);
        log.info("Fetching timeline for trip: {} for user: {}", tripId, userId);

        return tripAggregationService.getTripTimeline(tripId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    private Long extractUserId(Authentication authentication, String token) {
        // Try extracting from Authentication object first (if populated by filter)
        if (authentication != null && authentication.getPrincipal() != null) {
            // Logic depends on how Authentication is populated.
            // Assuming it might be generic, let's try token first as it is more reliable
            // with JwtUtil
        }

        if (token != null && token.startsWith("Bearer ")) {
            return jwtUtil.extractUserIdFromToken(token);
        }

        throw new RuntimeException("User not authenticated");
    }
}
