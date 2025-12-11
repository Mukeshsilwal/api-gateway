package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.service.BusAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Bus BFF Controller
 * Handles all bus-related aggregated endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/buses")
@RequiredArgsConstructor
@Tag(name = "Bus BFF", description = "Bus management aggregated APIs")
public class BusBffController {

    private final BusAggregator busAggregator;

    /**
     * Get complete bus information
     * Aggregates: bus, route, stops, seats, availability
     */
    @GetMapping("/{busId}/complete")
    @Operation(summary = "Get complete bus info",
            description = "Returns bus with route, stops, and seat availability")
    public CompletableFuture<ResponseEntity<Response<CompleteBusInfo>>> getCompleteBusInfo(
            @PathVariable Long busId) {

        log.info("BFF: Fetching complete bus info for busId: {}", busId);

        return busAggregator.getCompleteBusInfo(busId)
                .thenApply(info -> ResponseEntity.ok(
                        new Response<>(200, "Bus info retrieved successfully", info)))
                .exceptionally(ex -> {
                    log.error("Error fetching bus info", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch bus info", null));
                });
    }
//
//    /**
//     * Search buses with complete details
//     * Aggregates: search results, route info, seat availability
//     */
//    @PostMapping("/search")
//    @Operation(summary = "Search buses with details",
//            description = "Advanced bus search with complete information")
//    public CompletableFuture<ResponseEntity<Response<AggregatedBusSearchResults>>> searchBuses(
//            @Valid @RequestBody BusSearchRequest searchRequest) {
//
//        log.info("BFF: Searching buses from {} to {} on {}",
//                searchRequest.getSource(),
//                searchRequest.getDestination(),
//                searchRequest.getDate());
//
//        return busAggregator.searchBusesWithDetails(searchRequest)
//                .thenApply(results -> ResponseEntity.ok(
//                        new Response<>(200, "Search completed successfully", results)))
//                .exceptionally(ex -> {
//                    log.error("Bus search failed", ex);
//                    return ResponseEntity.status(500).body(
//                            new Response<>(500, "Search failed", null));
//                });
//    }
//
//    /**
//     * Get complete route information
//     * Aggregates: route, bus stops, buses on route
//     */
//    @GetMapping("/routes/{routeId}/complete")
//    @Operation(summary = "Get complete route info",
//            description = "Returns route with bus stops and buses")
//    public CompletableFuture<ResponseEntity<Response<CompleteRouteInfo>>> getCompleteRouteInfo(
//            @PathVariable Integer routeId) {
//
//        log.info("BFF: Fetching complete route info for: {}", routeId);
//
//        return busAggregator.getCompleteRouteInfo(routeId)
//                .thenApply(info -> ResponseEntity.ok(
//                        new Response<>(200, "Route info retrieved", info)))
//                .exceptionally(ex -> {
//                    log.error("Error fetching route info", ex);
//                    return ResponseEntity.status(500).body(
//                            new Response<>(500, "Failed to fetch route", null));
//                });
//    }

    /**
     * Get all bus stops with routes
     */
    @GetMapping("/stops/with-routes")
    @Operation(summary = "Get bus stops with routes",
            description = "Returns all bus stops with their routes")
    public CompletableFuture<ResponseEntity<Response<List<BusStopWithRoutes>>>> getBusStopsWithRoutes() {
        log.info("BFF: Fetching bus stops with routes");

        return busAggregator.getAllBusStopsWithRoutes()
                .thenApply(stops -> ResponseEntity.ok(
                        new Response<>(200, "Bus stops retrieved", stops)))
                .exceptionally(ex -> {
                    log.error("Error fetching bus stops", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch stops", null));
                });
    }

    /**
     * Get bus management dashboard
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get bus management dashboard",
            description = "Returns comprehensive dashboard data")
    public CompletableFuture<ResponseEntity<Response<BusManagementDashboard>>> getManagementDashboard() {
        log.info("BFF: Fetching bus management dashboard");

        return busAggregator.getManagementDashboard()
                .thenApply(dashboard -> ResponseEntity.ok(
                        new Response<>(200, "Dashboard retrieved", dashboard)))
                .exceptionally(ex -> {
                    log.error("Error fetching dashboard", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Dashboard fetch failed", null));
                });
    }
}
