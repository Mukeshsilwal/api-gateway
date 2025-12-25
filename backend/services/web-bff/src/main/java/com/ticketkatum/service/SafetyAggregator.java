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
public class SafetyAggregator {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.alert-service.url:http://localhost:8092/alert-service}")
    private String alertServiceUrl;

    @Value("${services.tracking-service.url:http://localhost:8094/tracking-service}")
    private String trackingServiceUrl;

    /**
     * Trigger a new SOS event
     */
    public Mono<Map<String, Object>> triggerSOS(Map<String, Object> sosData) {
        log.info("Triggering SOS through BFF: {}", sosData);

        return webClientBuilder.build()
                .post()
                .uri(alertServiceUrl + "/api/sos/trigger")
                .bodyValue(sosData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .doOnSuccess(res -> log.info("SOS triggered successfully: {}", res))
                .doOnError(e -> log.error("Fialed to trigger SOS", e));
    }

    /**
     * Update SOS heartbeat with current location
     */
    public Mono<Map<String, Object>> updateSOSHeartbeat(Long sosId, Map<String, Object> heartbeatData) {
        return webClientBuilder.build()
                .post()
                .uri(alertServiceUrl + "/api/sos/" + sosId + "/heartbeat")
                .bodyValue(heartbeatData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .doOnError(e -> log.error("Failed to update SOS heartbeat", e));
    }

    /**
     * Get active SOS for user
     */
    public Mono<List<Map<String, Object>>> getActiveSOS(Long userId) {
        return webClientBuilder.build()
                .get()
                .uri(alertServiceUrl + "/api/sos/active/user/" + userId)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .onErrorReturn(List.of());
    }

    /**
     * Get ALL active SOS in the system (Admin only)
     */
    public Mono<List<Map<String, Object>>> getAllActiveSOS() {
        return webClientBuilder.build()
                .get()
                .uri(alertServiceUrl + "/api/sos/active")
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .onErrorReturn(List.of());
    }

    /**
     * Get safety status for trip (Aggregates SOS + Tracking + Alerts)
     */
    public Mono<Map<String, Object>> getTripSafetyStatus(Long tripId) {
        return Mono.zip(
                getActiveAlertsForTrip(tripId),
                getLatestLocation(tripId)).map(tuple -> {
                    Map<String, Object> status = new HashMap<>();
                    status.put("activeAlerts", tuple.getT1());
                    status.put("latestLocation", tuple.getT2());
                    status.put("isUnsafe", !tuple.getT1().isEmpty());
                    return status;
                });
    }

    private Mono<List<Map<String, Object>>> getActiveAlertsForTrip(Long tripId) {
        return webClientBuilder.build()
                .get()
                .uri(alertServiceUrl + "/api/alerts/active/trip/" + tripId)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .collectList()
                .onErrorReturn(List.of());
    }

    private Mono<Map<String, Object>> getLatestLocation(Long tripId) {
        return webClientBuilder.build()
                .get()
                .uri(trackingServiceUrl + "/api/tracking/trip/" + tripId + "/latest")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .onErrorReturn(new HashMap<>());
    }
}
