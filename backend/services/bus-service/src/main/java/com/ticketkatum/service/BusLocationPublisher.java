package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.kafka.core.KafkaTemplate;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BusLocationPublisher {

    private final WebClient.Builder webClientBuilder;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${services.tracking-service.url:http://localhost:8088/tracking-service}")
    private String trackingServiceUrl;

    private static final String TRACKING_EVENTS_TOPIC = "tracking-events";

    /**
     * Publish bus location to tracking-service
     */
    @Async
    public void publishBusLocation(Long busId, Long tripId, BigDecimal latitude, BigDecimal longitude,
            BigDecimal speed, BigDecimal heading) {
        log.debug("Publishing location for bus: {} (trip: {})", busId, tripId);

        Map<String, Object> locationUpdate = new HashMap<>();
        locationUpdate.put("tripId", tripId);
        locationUpdate.put("entityType", "BUS");
        locationUpdate.put("entityId", busId);
        locationUpdate.put("latitude", latitude);
        locationUpdate.put("longitude", longitude);
        locationUpdate.put("speed", speed);
        locationUpdate.put("heading", heading);
        locationUpdate.put("timestamp", LocalDateTime.now());
        locationUpdate.put("isOffline", false);

        // Call tracking-service API
        webClientBuilder.build()
                .post()
                .uri(trackingServiceUrl + "/api/tracking/location")
                .bodyValue(locationUpdate)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> {
                    log.debug("Successfully published location for bus: {}", busId);
                    publishLocationEvent(busId, tripId, latitude, longitude);
                })
                .doOnError(e -> log.error("Failed to publish bus location to tracking-service", e))
                .subscribe();
    }

    /**
     * Publish location event to Kafka
     */
    private void publishLocationEvent(Long busId, Long tripId, BigDecimal latitude, BigDecimal longitude) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "bus.location.updated");
            event.put("busId", busId);
            event.put("tripId", tripId);
            event.put("latitude", latitude);
            event.put("longitude", longitude);
            event.put("timestamp", LocalDateTime.now());

            kafkaTemplate.send(TRACKING_EVENTS_TOPIC, busId.toString(), event);
            log.debug("Published bus.location.updated event for bus: {}", busId);
        } catch (Exception e) {
            log.error("Failed to publish location event to Kafka", e);
        }
    }

    /**
     * Get live location for a bus
     */
    public Mono<Map> getBusLiveLocation(Long busId) {
        log.debug("Fetching live location for bus: {}", busId);

        return webClientBuilder.build()
                .get()
                .uri(trackingServiceUrl + "/api/tracking/BUS/" + busId + "/latest")
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Failed to fetch bus location", e))
                .onErrorReturn(new HashMap<>());
    }
}
