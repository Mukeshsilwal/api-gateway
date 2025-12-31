package com.ticketkatum.controller;


import com.ticketkatum.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/bff/journeys")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Journey Management BFF", description = "BFF endpoints for journey management")
public class JourneyManagementController {

    private final com.ticketkatum.tripservice.service.TripService tripService;
    private final JwtUtil jwtUtil;

    @PostMapping("/generate")
    @Operation(summary = "Generate journey", description = "Generate journey for a trip")
    public Mono<ResponseEntity<Map<String, Object>>> generateJourney(
            @RequestParam("tripId") Long tripId,
            @RequestParam("userId") Long userId,
            HttpServletRequest request) { 

        log.info("BFF: Generating journey for trip: {}", tripId);
        return Mono.fromCallable(() -> tripService.initializeJourney(tripId, userId))
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                .map(journey -> {
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("message", "Journey generated successfully");
                    response.put("data", journey);
                    return ResponseEntity.ok(response);
                })
                .doOnError(e -> log.error("Error generating journey", e))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @GetMapping("/{journeyId}")
    public Mono<ResponseEntity<Map<String, Object>>> getJourney(@PathVariable("journeyId") Long journeyId) {
        return Mono.fromCallable(() -> tripService.getJourney(journeyId))
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                .map(journey -> {
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("data", journey);
                    return ResponseEntity.ok(response);
                })
                .defaultIfEmpty(ResponseEntity.notFound().build())
                .doOnError(e -> log.error("Error fetching journey", e))
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping("/trip/{tripId}")
    public Mono<ResponseEntity<Map<String, Object>>> getJourneyByTripId(@PathVariable("tripId") Long tripId) {
        return Mono.fromCallable(() -> tripService.getJourneyByTrip(tripId))
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                .flatMap(journey -> {
                    if (journey == null) return Mono.empty();
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("data", journey);
                    return Mono.just(ResponseEntity.ok(response));
                })
                .switchIfEmpty(Mono.fromCallable(() -> ResponseEntity.notFound().build()))
                .doOnError(e -> log.error("Error fetching journey by trip", e))
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }
}
