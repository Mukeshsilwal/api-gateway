package com.ticketkatum.client;

import com.ticketkatum.dto.tracking.LocationDTO;
import com.ticketkatum.config.ServiceUrlConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrackingClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrlConfig;

    public Flux<LocationDTO> getTripLocations(Long tripId) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getTrackingServiceUrl()).build()
                .get()
                .uri("/api/tracking/trip/" + tripId)
                .retrieve()
                .bodyToFlux(LocationDTO.class);
    }

    public Mono<LocationDTO> getLatestLocation(String entityType, Long entityId) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getTrackingServiceUrl()).build()
                .get()
                .uri("/api/tracking/" + entityType + "/" + entityId + "/latest")
                .retrieve()
                .bodyToMono(LocationDTO.class);
    }
}
