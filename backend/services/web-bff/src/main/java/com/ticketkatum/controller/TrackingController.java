package com.ticketkatum.controller;

import com.ticketkatum.dto.tracking.LocationDTO;
import com.ticketkatum.service.TrackingService;
import reactor.core.publisher.Mono;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bff/v1/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking Management", description = "Aggregated Tracking APIs for Web")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get trip locations", description = "Fetch all locations associated with a trip")
    public Mono<ResponseEntity<List<LocationDTO>>> getTripLocations(@PathVariable Long tripId) {
        return trackingService.getTripLocations(tripId)
                .collectList()
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{entityType}/{entityId}/latest")
    @Operation(summary = "Get latest location", description = "Fetch latest location for an entity")
    public Mono<ResponseEntity<LocationDTO>> getLatestLocation(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return trackingService.getLatestLocation(entityType, entityId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
