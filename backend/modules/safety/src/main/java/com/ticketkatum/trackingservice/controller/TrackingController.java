package com.ticketkatum.trackingservice.controller;

import com.ticketkatum.trackingservice.dto.LocationDTO;
import com.ticketkatum.trackingservice.dto.request.LocationUpdateRequest;
import com.ticketkatum.trackingservice.entity.LocationTracking;
import com.ticketkatum.trackingservice.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("safetyTrackingController")
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Location Tracking", description = "APIs for real-time location tracking")
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/location")
    @Operation(summary = "Update location", description = "Submit a new location update")
    public ResponseEntity<LocationDTO> updateLocation(@Valid @RequestBody LocationUpdateRequest request) {
        log.info("Received location update for {} {}", request.getEntityType(), request.getEntityId());
        LocationDTO location = trackingService.updateLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }

    @GetMapping("/{entityType}/{entityId}/latest")
    @Operation(summary = "Get latest location", description = "Get the most recent location for an entity")
    public ResponseEntity<LocationDTO> getLatestLocation(
            @PathVariable("entityType") LocationTracking.EntityType entityType,
            @PathVariable("entityId") Long entityId) {
        
        log.info("Fetching latest location for {} {}", entityType, entityId);
        LocationDTO location = trackingService.getLatestLocation(entityType, entityId);
        
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(location);
    }

    @GetMapping("/{entityType}/{entityId}/history")
    @Operation(summary = "Get location history", description = "Get location history for an entity")
    public ResponseEntity<List<LocationDTO>> getLocationHistory(
            @PathVariable("entityType") LocationTracking.EntityType entityType,
            @PathVariable("entityId") Long entityId,
            @RequestParam(defaultValue = "24") int hours) {
        
        log.info("Fetching location history for {} {} (last {} hours)", entityType, entityId, hours);
        List<LocationDTO> locations = trackingService.getLocationHistory(entityType, entityId, hours);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get trip locations", description = "Get all locations for a trip")
    public ResponseEntity<List<LocationDTO>> getTripLocations(@PathVariable("tripId") Long tripId) {
        log.info("Fetching locations for trip: {}", tripId);
        List<LocationDTO> locations = trackingService.getTripLocations(tripId);
        return ResponseEntity.ok(locations);
    }
}
