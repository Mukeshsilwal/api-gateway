package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.service.AdminAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * Admin BFF Controller
 * Handles admin operations with cascading effects
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin BFF", description = "Admin management aggregated APIs")
public class AdminBffController {

    private final AdminAggregator adminAggregator;

    /**
     * Create bus with seats
     * Aggregates: bus creation, seat generation
     */
    @PostMapping("/buses/create-with-seats")
    @Operation(summary = "Create bus with seats",
            description = "Create bus and generate seats in one operation")
    public CompletableFuture<ResponseEntity<Response<BusCreationResponse>>> createBusWithSeats(
            @Valid @RequestBody BusCreationRequest request) {

        log.info("BFF: Creating bus with {} seats for route: {}",
                request.getNumberOfSeats(), request.getRouteId());

        return adminAggregator.createBusWithSeats(
                        request.getBusDto(),
                        request.getRouteId(),
                        request.getNumberOfSeats()
                ).thenApply(response -> ResponseEntity.ok(
                        new Response<>(201, "Bus and seats created", response)))
                .exceptionally(ex -> {
                    log.error("Bus creation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Creation failed", null));
                });
    }

    /**
     * Delete bus with all seats
     * Aggregates: seat deletion, bus deletion
     */
    @DeleteMapping("/buses/{busId}/with-seats")
    @Operation(summary = "Delete bus with seats",
            description = "Delete bus and all associated seats")
    public CompletableFuture<ResponseEntity<Response<DeletionResponse>>> deleteBusWithSeats(
            @PathVariable Long busId) {

        log.info("BFF: Deleting bus and seats: {}", busId);

        return adminAggregator.deleteBusWithSeats(busId)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Deletion completed", response)))
                .exceptionally(ex -> {
                    log.error("Deletion failed", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Deletion failed", null));
                });
    }

    /**
     * Create route with bus stops
     * Aggregates: route creation with source and destination stops
     */
    @PostMapping("/routes/create-with-stops")
    @Operation(summary = "Create route with stops",
            description = "Create route with bus stops")
    public CompletableFuture<ResponseEntity<Response<RouteCreationResponse>>> createRouteWithStops(
            @Valid @RequestBody RouteCreationRequest request) {

        log.info("BFF: Creating route with stops: {} to {}",
                request.getSourceStopId(), request.getDestinationStopId());

        return adminAggregator.createRouteWithBusStops(
                        request.getRouteDto(),
                        request.getSourceStopId(),
                        request.getDestinationStopId()
                ).thenApply(response -> ResponseEntity.ok(
                        new Response<>(201, "Route created", response)))
                .exceptionally(ex -> {
                    log.error("Route creation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Creation failed", null));
                });
    }
}
