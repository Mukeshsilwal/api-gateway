package com.ticketkatum.trackingservice.controller;

import com.ticketkatum.trackingservice.dto.POIDTO;
import com.ticketkatum.trackingservice.entity.PointOfInterest;
import com.ticketkatum.trackingservice.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/poi")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Points of Interest", description = "APIs for finding nearby POIs")
public class POIController {

    private final TrackingService trackingService;

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby POIs", description = "Find points of interest near a location")
    public ResponseEntity<List<POIDTO>> findNearbyPOIs(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5.0") double radiusKm) {
        
        log.info("Finding POIs near ({}, {}) within {} km", latitude, longitude, radiusKm);
        List<POIDTO> pois = trackingService.findNearbyPOIs(latitude, longitude, radiusKm);
        return ResponseEntity.ok(pois);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Find POIs by category", description = "Find POIs by category and region")
    public ResponseEntity<List<POIDTO>> findPOIsByCategory(
            @PathVariable("category") PointOfInterest.POICategory category,
            @RequestParam(required = false) String region) {
        
        log.info("Finding POIs by category: {} in region: {}", category, region);
        List<POIDTO> pois = trackingService.findPOIsByCategory(category, region);
        return ResponseEntity.ok(pois);
    }
}
