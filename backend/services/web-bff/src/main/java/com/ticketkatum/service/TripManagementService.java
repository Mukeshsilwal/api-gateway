package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripManagementService {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.trip-service.url:http://localhost:8095/trip-service}")
    private String tripServiceUrl;

    /**
     * Create a new trip
     */
    public Mono<Map> createTrip(Long userId, Map<String, Object> tripRequest) {
        log.debug("Creating trip via BFF for user: {}", userId);

        return webClientBuilder.build()
                .post()
                .uri(tripServiceUrl + "/api/trips")
                .header("X-User-Id", String.valueOf(userId))
                .bodyValue(tripRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(trip -> log.debug("Trip created: {}", trip.get("tripId")))
                .doOnError(e -> log.error("Failed to create trip", e));
    }

    /**
     * Get trip by ID
     */
    public Mono<Map> getTripById(Long tripId) {
        log.debug("Fetching trip: {}", tripId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip: {}", tripId, e));
    }

    /**
     * Get trip details with checkpoints
     */
    public Mono<Map> getTripDetails(Long tripId) {
        log.debug("Fetching trip details: {}", tripId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/details")
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip details: {}", tripId, e));
    }

    /**
     * Get user's trips
     */
    public Flux<Map> getMyTrips() {
        log.debug("Fetching user trips");

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/my-trips")
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnError(e -> log.error("Failed to fetch user trips", e));
    }

    /**
     * Get user's trips by status
     */
    public Flux<Map> getMyTripsByStatus(String status) {
        log.debug("Fetching user trips with status: {}", status);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/my-trips/status/" + status)
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnError(e -> log.error("Failed to fetch trips by status", e));
    }

    /**
     * Update trip
     */
    public Mono<Map> updateTrip(Long tripId, Map<String, Object> updateRequest) {
        log.debug("Updating trip: {}", tripId);

        return webClientBuilder.build()
                .put()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .bodyValue(updateRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(trip -> log.debug("Trip updated: {}", tripId))
                .doOnError(e -> log.error("Failed to update trip: {}", tripId, e));
    }

    /**
     * Update trip status
     */
    public Mono<Map> updateTripStatus(Long tripId, String status) {
        log.debug("Updating trip status: {} to {}", tripId, status);

        return webClientBuilder.build()
                .put()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/status?status=" + status)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(trip -> log.debug("Trip status updated: {}", tripId))
                .doOnError(e -> log.error("Failed to update trip status: {}", tripId, e));
    }

    /**
     * Delete trip
     */
    public Mono<Void> deleteTrip(Long tripId) {
        log.debug("Deleting trip: {}", tripId);

        return webClientBuilder.build()
                .delete()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.debug("Trip deleted: {}", tripId))
                .doOnError(e -> log.error("Failed to delete trip: {}", tripId, e));
    }

    /**
     * Get trip bookings
     */
    public Flux<Map> getTripBookings(Long tripId) {
        log.debug("Fetching bookings for trip: {}", tripId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/bookings")
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip bookings: {}", tripId, e));
    }
}
