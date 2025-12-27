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
    public Mono<Map> getTripById(Long tripId, Long userId) {
        log.debug("Fetching trip: {} for user: {}", tripId, userId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip: {}", tripId, e));
    }

    /**
     * Initialize itinerary for a trip
     */
    public Mono<Void> initializeItinerary(Long tripId) {
        log.debug("Initializing itinerary for trip: {}", tripId);

        return webClientBuilder.build()
                .post()
                .uri(tripServiceUrl + "/api/trips/{tripId}/itinerary/initialize", tripId)
                .retrieve()
                .toBodilessEntity()
                .then() // Convert Mono<ResponseEntity<Void>> to Mono<Void>
                .doOnSuccess(v -> log.debug("Itinerary initialized for trip: {}", tripId))
                .doOnError(e -> log.error("Failed to initialize itinerary for trip: {}", tripId, e));
    }

    /**
     * Get trip details with checkpoints
     */
    public Mono<Map> getTripDetails(Long tripId, Long userId) {
        log.debug("Fetching trip details: {} for user: {}", tripId, userId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/details")
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip details: {}", tripId, e));
    }

    /**
     * Get user's trips
     */
    public Flux<Map> getMyTrips() {
        // Deprecated: Use getUserTrips
        return Flux.error(new UnsupportedOperationException("Use getUserTrips instead"));
    }

    /**
     * Get user's trips by status
     */
    public Flux<Map> getMyTripsByStatus(String status) {
        // Deprecated: Use getUserTripsByStatus with userId
        return Flux.error(new UnsupportedOperationException("Use getUserTripsByStatus with userId instead"));
    }

    /**
     * Update trip
     */
    public Mono<Map> updateTrip(Long tripId, Map<String, Object> updateRequest, Long userId) {
        log.debug("Updating trip: {} for user: {}", tripId, userId);

        return webClientBuilder.build()
                .put()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .header("X-User-Id", String.valueOf(userId))
                .bodyValue(updateRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(trip -> log.debug("Trip updated: {}", tripId))
                .doOnError(e -> log.error("Failed to update trip: {}", tripId, e));
    }

    /**
     * Update trip status
     */
    public Mono<Map> updateTripStatus(Long tripId, String status, Long userId) {
        log.debug("Updating trip status: {} to {} for user: {}", tripId, status, userId);

        return webClientBuilder.build()
                .put()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/status?status=" + status)
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(trip -> log.debug("Trip status updated: {}", tripId))
                .doOnError(e -> log.error("Failed to update trip status: {}", tripId, e));
    }

    /**
     * Delete trip
     */
    public Mono<Void> deleteTrip(Long tripId, Long userId) {
        log.debug("Deleting trip: {} for user: {}", tripId, userId);

        return webClientBuilder.build()
                .delete()
                .uri(tripServiceUrl + "/api/trips/" + tripId)
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.debug("Trip deleted: {}", tripId))
                .doOnError(e -> log.error("Failed to delete trip: {}", tripId, e));
    }

    /**
     * Get trip bookings
     */
    public Flux<Map> getTripBookings(Long tripId, Long userId) {
        log.debug("Fetching bookings for trip: {} for user: {}", tripId, userId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/bookings")
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToFlux(Map.class)
                .doOnError(e -> log.error("Failed to fetch trip bookings: {}", tripId, e));
    }

    /**
     * Get trip with full itinerary (days + journeys)
     */
    public Mono<Map> getTripFullItinerary(Long tripId, Long userId) {
        log.debug("Fetching trip full itinerary: {} for user: {}", tripId, userId);

        // Since Trip Service now aggregates everything (Journeys, ItineraryDays),
        // we just fetch the detailed trip which includes everything.
        return getTripDetails(tripId, userId);
    }

    /**
     * Generate journey for trip
     */
    public Mono<Map> generateJourney(Long tripId, Long userId) {
        log.debug("Generating journey via BFF for trip: {}", tripId);

        return webClientBuilder.build()
                .post()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/journeys/generate")
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to generate journey for trip: {}", tripId, e));
    }

    /**
     * Add checkpoint to journey
     */
    public Mono<Map> addCheckpoint(Long journeyId, Map<String, Object> checkpointRequest) {
        log.debug("Adding checkpoint via BFF to journey: {}", journeyId);

        return webClientBuilder.build()
                .post()
                .uri(tripServiceUrl + "/api/trips/journeys/" + journeyId + "/checkpoints")
                .bodyValue(checkpointRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to add checkpoint to journey: {}", journeyId, e));
    }

    /**
     * Delete checkpoint from journey
     */
    public Mono<Void> deleteCheckpoint(Long journeyId, Long checkpointId) {
        log.debug("Deleting checkpoint via BFF: {} from journey: {}", checkpointId, journeyId);

        return webClientBuilder.build()
                .delete()
                .uri(tripServiceUrl + "/api/trips/journeys/" + journeyId + "/checkpoints/" + checkpointId)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(
                        e -> log.error("Failed to delete checkpoint: {} from journey: {}", checkpointId, journeyId, e));
    }
}
