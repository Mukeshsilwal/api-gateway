package com.ticketkatum.service;

import com.ticketkatum.client.TrackingClient;
import com.ticketkatum.dto.tracking.LocationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {

    private final TrackingClient trackingClient;

    public Flux<LocationDTO> getTripLocations(Long tripId) {
        return trackingClient.getTripLocations(tripId)
                .onErrorResume(e -> {
                    log.error("Error fetching trip locations for tripId: {}", tripId, e);
                    return Flux.empty();
                });
    }

    public Mono<LocationDTO> getLatestLocation(String entityType, Long entityId) {
        return trackingClient.getLatestLocation(entityType, entityId)
                .onErrorResume(e -> {
                    log.error("Error fetching latest location for {} {}", entityType, entityId, e);
                    return Mono.empty();
                });
    }
}
