package com.ticketkatum.controller;

import com.ticketkatum.service.HotelPOIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Hotel POI Integration", description = "APIs for hotel POI integration")
public class HotelPOIController {

    private final HotelPOIService hotelPOIService;

    @GetMapping("/{hotelId}/nearby-pois")
    @Operation(summary = "Get nearby POIs", description = "Get points of interest near a hotel")
    public Mono<ResponseEntity<List<Map>>> getNearbyPOIs(
            @PathVariable Long hotelId,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {

        log.info("Fetching POIs near hotel: {}", hotelId);

        return hotelPOIService.getNearbyPOIs(latitude, longitude, radiusKm)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(null);
    }

    @GetMapping("/{hotelId}/nearby-pois/{category}")
    @Operation(summary = "Get nearby POIs by category", description = "Get specific category POIs near hotel")
    public Mono<ResponseEntity<List<Map>>> getPOIsByCategory(
            @PathVariable Long hotelId,
            @PathVariable String category,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {
        
        log.info("Fetching {} POIs near hotel: {}", category, hotelId);
        
        return hotelPOIService.getPOIsByCategory(category, latitude, longitude, radiusKm)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(null);
    }
}
