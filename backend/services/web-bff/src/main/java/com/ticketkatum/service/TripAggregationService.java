package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripAggregationService {

    private final WebClient.Builder webClientBuilder;
    private final PersonalizationService personalizationService;

    @Value("${services.trip-service.url:http://localhost:8095/trip-service}")
    private String tripServiceUrl;

    @Value("${services.tracking-service.url:http://localhost:8094/tracking-service}")
    private String trackingServiceUrl;

    @Value("${services.alert-service.url:http://localhost:8092/alert-service}")
    private String alertServiceUrl;

    @Value("${services.booking-service.url:http://localhost:8081/booking-service}")
    private String bookingServiceUrl;

    /**
     * Update trip status and evict cache
     */
    @org.springframework.cache.annotation.CacheEvict(value = "tripDetails", key = "#tripId")
    public Mono<Void> updateTripStatus(Long tripId, String status) {
        return webClientBuilder.build()
                .put()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/status")
                .bodyValue(Map.of("status", status))
                .retrieve()
                .bodyToMono(Void.class);
    }

    /**
     * Get comprehensive trip dashboard data
     */
    public Mono<Map<String, Object>> getTripDashboard(Long tripId, Long userId) {
        log.info("Aggregating dashboard data for trip: {} for user: {}", tripId, userId);

        return Mono.zip(
                getTripDetails(tripId, userId),
                getTripBookings(tripId, userId),
                getLiveTracking(tripId),
                getActiveAlerts(tripId)).flatMap(tuple -> {
                    Map<String, Object> dashboard = new HashMap<>();
                    dashboard.put("trip", tuple.getT1());
                    dashboard.put("bookings", tuple.getT2());
                    dashboard.put("liveTracking", tuple.getT3());
                    dashboard.put("activeAlerts", tuple.getT4());

                    // Add Smart Recommendations
                    dashboard.put("recommendations",
                            personalizationService.getTripRecommendations(new HashMap<>(), tuple.getT1()));

                    // Add Booking Summary (Hardening)
                    List<Map<String, Object>> bookings = tuple.getT2();
                    Map<String, Object> bookingSummary = new HashMap<>();
                    bookingSummary.put("total", bookings.size());
                    bookingSummary.put("confirmed",
                            bookings.stream().filter(b -> "CONFIRMED".equals(b.get("status"))).count());
                    bookingSummary.put("pending",
                            bookings.stream().filter(b -> "PENDING".equals(b.get("status"))).count());
                    dashboard.put("bookingSummary", bookingSummary);

                    return Mono.just(dashboard);
                }).doOnSuccess(dashboard -> log.info("Successfully aggregated dashboard for trip: {}", tripId))
                .doOnError(e -> log.error("Failed to aggregate dashboard for trip: {}", tripId, e));
    }

    /**
     * Get aggregated timeline for trip
     */
    public Mono<Map<String, Object>> getTripTimeline(Long tripId, Long userId) {
        log.info("Aggregating timeline data for trip: {} for user: {}", tripId, userId);

        return Mono.zip(
                getTripDetails(tripId, userId),
                getTripBookings(tripId, userId),
                getLiveTracking(tripId)).map(tuple -> {
                    Map<String, Object> tripDetails = tuple.getT1();
                    List<Map<String, Object>> bookings = tuple.getT2();
                    Map<String, Object> tracking = tuple.getT3();

                    Map<String, Object> timelineData = new HashMap<>();

                    // Extract checkpoints safely
                    Object checkpointsObj = tripDetails.get("checkpoints");
                    if (checkpointsObj instanceof List) {
                        timelineData.put("checkpoints", checkpointsObj);
                    } else {
                        timelineData.put("checkpoints", List.of());
                    }

                    timelineData.put("bookings", bookings);
                    timelineData.put("currentLocation", tracking.getOrDefault("latestLocation", null));

                    return timelineData;
                }).doOnSuccess(data -> log.info("Successfully aggregated timeline for trip: {}", tripId))
                .doOnError(e -> log.error("Failed to aggregate timeline for trip: {}", tripId, e));
    }

    /**
     * Get user's trips with summary
     */
    public Mono<List<Map<String, Object>>> getUserTrips(Long userId) {
        log.info("Fetching trips for user: {}", userId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/user/" + userId)
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .flatMap(this::enrichTripWithSummary)
                .collectList()
                .doOnSuccess(trips -> log.info("Retrieved {} trips for user: {}", trips.size(), userId))
                .doOnError(e -> log.error("Failed to fetch trips for user: {}", userId, e));
    }

    /**
     * Get trip details from trip-service
     */
    @org.springframework.cache.annotation.Cacheable(value = "tripDetails", key = "#tripId")
    public Mono<Map<String, Object>> getTripDetails(Long tripId, Long userId) {
        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/details")
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .doOnError(e -> log.error("Failed to fetch trip details", e))
                .onErrorReturn(new HashMap<>());
    }

    /**
     * Get trip bookings from booking-service
     */
    @org.springframework.cache.annotation.Cacheable(value = "tripBookings", key = "#tripId")
    public Mono<List<Map<String, Object>>> getTripBookings(Long tripId, Long userId) {
        return webClientBuilder.build()
                .get()
                .uri(bookingServiceUrl + "/api/bookings/trip/" + tripId)
                // Note: Booking Service might also need X-User-Id, adding it for consistency
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .doOnError(e -> log.error("Failed to fetch trip bookings", e))
                .onErrorReturn(List.of());
    }

    /**
     * Get live tracking data from tracking-service
     */
    private Mono<Map<String, Object>> getLiveTracking(Long tripId) {
        return webClientBuilder.build()
                .get()
                .uri(trackingServiceUrl + "/api/tracking/trip/" + tripId)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .map(locations -> {
                    Map<String, Object> tracking = new HashMap<>();
                    tracking.put("locations", locations);
                    tracking.put("hasLiveData", !locations.isEmpty());
                    if (!locations.isEmpty()) {
                        tracking.put("latestLocation", locations.get(0));
                    }
                    return tracking;
                })
                .doOnError(e -> log.error("Failed to fetch live tracking", e))
                .onErrorReturn(Map.of("hasLiveData", false, "locations", List.of()));
    }

    /**
     * Get active alerts from alert-service
     */
    private Mono<List<Map<String, Object>>> getActiveAlerts(Long tripId) {
        return webClientBuilder.build()
                .get()
                .uri(alertServiceUrl + "/api/alerts/active")
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .doOnError(e -> log.error("Failed to fetch active alerts", e))
                .onErrorReturn(List.of());
    }

    /**
     * Enrich trip with summary data
     */
    private Mono<Map<String, Object>> enrichTripWithSummary(Map<String, Object> trip) {
        Long tripId = getLongValue(trip.get("tripId"));
        if (tripId == null) {
            return Mono.just(trip);
        }

        return Mono.zip(
                getActiveAlerts(tripId).map(List::size),
                getLiveTracking(tripId).map(tracking -> (Boolean) tracking.getOrDefault("hasLiveData", false)))
                .map(tuple -> {
                    Map<String, Object> enriched = new HashMap<>(trip);
                    enriched.put("activeAlertsCount", tuple.getT1());
                    enriched.put("hasLiveTracking", tuple.getT2());
                    return enriched;
                }).onErrorReturn(trip);
    }

    private Long getLongValue(Object value) {
        if (value == null)
            return null;
        if (value instanceof Long)
            return (Long) value;
        if (value instanceof Integer)
            return ((Integer) value).longValue();
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
