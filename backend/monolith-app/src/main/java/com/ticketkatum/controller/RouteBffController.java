package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.RouteDto;
import com.ticketkatum.service.BusAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Route BFF Controller
 * Handles route-related operations
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/routes")
@RequiredArgsConstructor
@Tag(name = "Route BFF", description = "Route management APIs")
public class RouteBffController {

    private final BusAggregator busAggregator;

    /**
     * Get all routes
     */
    @GetMapping
    @Operation(summary = "Get all routes", description = "Returns list of all available routes")
    public CompletableFuture<ResponseEntity<Response<List<RouteDto>>>> getAllRoutes() {
        log.info("BFF: Fetching all routes");
        return busAggregator.getAllRoutes()
                .thenApply(routes -> ResponseEntity.ok(
                        new Response<>(200, "Routes retrieved successfully", routes)))
                .exceptionally(ex -> {
                    log.error("Error fetching all routes", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch routes", null));
                });
    }

    /**
     * Get route by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get route by ID", description = "Returns specific route details")
    public CompletableFuture<ResponseEntity<Response<RouteDto>>> getRouteById(@PathVariable Integer id) {
        log.info("BFF: Fetching route: {}", id);
        return busAggregator.getRouteById(id)
                .thenApply(route -> ResponseEntity.ok(
                        new Response<>(200, "Route retrieved successfully", route)))
                .exceptionally(ex -> {
                    log.error("Error fetching route", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch route", null));
                });
    }
}
