package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.exception.BusinessException;
import com.ticketkatum.exception.ValidationException;
import com.ticketkatum.service.AdminAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Complete Admin BFF Controller
 * Handles all admin operations with cascading effects
 * Requires ADMIN role for all operations
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin BFF", description = "Admin management aggregated APIs")
public class AdminBffController {

    private final AdminAggregator adminAggregator;
    private final com.ticketkatum.service.LiveTrackingService liveTrackingService;
    private static final long OPERATION_TIMEOUT_SECONDS = 30;

    // ==================== DASHBOARD ENDPOINTS ====================

    /**
     * Create bus in route (without seats)
     */
    @PostMapping("/routes/{routeId}/buses")
    @Operation(summary = "Create bus in route", description = "Create bus for a specific route without seats. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<BusDto>>> createBusInRoute(
            @Valid @RequestBody BusDto busDto,
            @PathVariable("routeId") Long routeId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Creating bus for route: {}", correlationId, routeId);

        if (routeId == null || routeId <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<BusDto>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid route ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.createBusInRoute(busDto, routeId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Bus created successfully: busId={}",
                            correlationId, response.getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<BusDto>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Bus created successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus creation"));
    }

    /**
     * Get dashboard summary
     */
    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Get aggregated dashboard summary. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.admin.DashboardSummaryDto>>> getDashboardSummary(
            @RequestParam(defaultValue = "30d") String window,
            @RequestParam(defaultValue = "Asia/Kathmandu") String tz) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching dashboard summary", correlationId);

        return adminAggregator.getDashboardSummary(window, tz)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(summary -> {
                    // Generate ETag based on hash of content
                    String eTag = String.valueOf(summary.hashCode());

                    return ResponseEntity.ok()
                            .eTag(eTag)
                            .body(Response.<com.ticketkatum.dto.admin.DashboardSummaryDto>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Dashboard summary fetched successfully")
                                    .data(summary)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Dashboard summary fetch"));
    }

    /**
     * Live bus tracking stream (SSE)
     */
    @GetMapping(value = "/live/buses/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Live bus tracking stream", description = "Stream live bus locations via SSE. Requires ADMIN role.")
    public reactor.core.publisher.Flux<org.springframework.http.codec.ServerSentEvent<com.ticketkatum.service.LiveTrackingService.LiveTrackingPayload>> getBusStream() {
        return liveTrackingService.getBusLocationStream()
                .map(payload -> org.springframework.http.codec.ServerSentEvent.builder(payload)
                        .build());
    }

    /**
     * Live bus tracking snapshot (Fallback)
     */
    @GetMapping("/live/buses/snapshot")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Live bus tracking snapshot", description = "Get snapshot of live bus locations. Requires ADMIN role.")
    public ResponseEntity<Response<com.ticketkatum.service.LiveTrackingService.LiveTrackingPayload>> getBusSnapshot() {
        return ResponseEntity.ok(
                Response.<com.ticketkatum.service.LiveTrackingService.LiveTrackingPayload>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Live tracking snapshot fetched successfully")
                        .data(liveTrackingService.getSnapshot())
                        .build());
    }

    /**
     * Global search
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Global search", description = "Search across buses, routes, etc. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.admin.DashboardSearchResponse>>> globalSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "buses,routes,tickets") String entities) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Global search: {}", correlationId, q);

        if (q == null || q.length() < 2) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<com.ticketkatum.dto.admin.DashboardSearchResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Query must be at least 2 characters")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.globalSearch(q, entities)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> ResponseEntity.ok(
                        Response.<com.ticketkatum.dto.admin.DashboardSearchResponse>builder()
                                .statusCode(HttpStatus.OK.value())
                                .message("Search completed successfully")
                                .data(response)
                                .build()))
                .exceptionally(ex -> handleException(ex, correlationId, "Global search"));
    }

    // ==================== BUS STOP ENDPOINTS ====================

    /**
     * Create a new bus stop
     */
    @PostMapping("/bus-stops")
    @Operation(summary = "Create bus stop", description = "Create a new bus stop. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<BusStopDto>>> createBusStop(
            @Valid @RequestBody BusStopDto busStopDto) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Creating bus stop: {}", correlationId, busStopDto.getName());

        return adminAggregator.createBusStop(busStopDto)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Bus stop created successfully: id={}",
                            correlationId, response.getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<BusStopDto>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Bus stop created successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus stop creation"));
    }

    /**
     * Update bus stop
     */
    @PutMapping("/bus-stops/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update bus stop", description = "Update an existing bus stop. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<BusStopDto>>> updateBusStop(
            @Valid @RequestBody BusStopDto busStopDto,
            @PathVariable Long id) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Updating bus stop: {}", correlationId, id);

        if (id == null || id <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<BusStopDto>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid bus stop ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.updateBusStop(busStopDto, id)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Bus stop updated successfully: id={}", correlationId, id);
                    return ResponseEntity.ok(
                            Response.<BusStopDto>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Bus stop updated successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus stop update"));
    }

    /**
     * Delete bus stop
     */
    @DeleteMapping("/bus-stops/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bus stop", description = "Delete a bus stop. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteBusStop(
            @PathVariable Long id) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Deleting bus stop: {}", correlationId, id);

        if (id == null || id <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid bus stop ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.deleteBusStop(id)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Bus stop deleted successfully: id={}", correlationId, id);
                    return ResponseEntity.ok(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Bus stop deleted successfully")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus stop deletion"));
    }

    // ==================== ROUTE ENDPOINTS ====================

    /**
     * Create route with bus stops
     */
    @PostMapping("/routes/create-with-stops")
    @Operation(summary = "Create route with stops", description = "Create route with bus stops. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<RouteCreationResponse>>> createRouteWithStops(
            @Valid @RequestBody RouteCreationRequest request) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Creating route with stops: {} to {}",
                correlationId, request.getSourceStopId(), request.getDestinationStopId());

        if (request.getSourceStopId() == null || request.getDestinationStopId() == null) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Source and destination stop IDs are required")
                                    .data(null)
                                    .build()));
        }

        if (request.getSourceStopId().equals(request.getDestinationStopId())) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Source and destination stops must be different")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.createRouteWithBusStops(
                        request.getRouteDto(),
                        request.getSourceStopId(),
                        request.getDestinationStopId())
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Route created successfully: routeId={}",
                            correlationId, response.getRoute().getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Route created successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Route creation"));
    }

    /**
     * Delete route
     */
    @DeleteMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete route", description = "Delete a route. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteRoute(
            @PathVariable Long id) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Deleting route: {}", correlationId, id);

        if (id == null || id <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid route ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.deleteRoute(id)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Route deleted successfully: id={}", correlationId, id);
                    return ResponseEntity.ok(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Route deleted successfully")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Route deletion"));
    }

    // ==================== BUS ENDPOINTS ====================

    /**
     * Create bus with seats
     */
    @PostMapping("/seats")
    public CompletableFuture<ResponseEntity<Response<SeatCreationResponse>>> createSeat(
            @RequestBody @Valid SeatDto seatDto) {

        log.info("Controller: Create seat {}", seatDto.getSeatNumber());

        return adminAggregator.createSeat(seatDto)
                .thenApply(seatResponse ->
                        ResponseEntity.status(HttpStatus.CREATED)
                                .body(Response.<SeatCreationResponse>builder()
                                        .statusCode(HttpStatus.CREATED.value())
                                        .message("Seat created successfully")
                                        .data(seatResponse)
                                        .build())
                );
    }

    /**
     * Delete bus with all seats
     */
    @DeleteMapping("/buses/{busId}/with-seats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bus with seats", description = "Delete bus and all associated seats. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<DeletionResponse>>> deleteBusWithSeats(
            @PathVariable Long busId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Deleting bus and seats: {}", correlationId, busId);

        if (busId == null || busId <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<DeletionResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid bus ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.deleteBusWithSeats(busId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Bus deleted successfully: busId={}, seatsDeleted={}",
                            correlationId, busId, response.getSeatsDeleted());
                    return ResponseEntity.ok(
                            Response.<DeletionResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Bus and seats deleted successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus deletion"));
    }

    // ==================== SEAT ENDPOINTS ====================

    /**
     * Create seat for bus
     */
    @PostMapping("/buses/{busId}/seats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create seat for bus", description = "Create a new seat for a specific bus. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<SeatDto>>> createSeatForBus(
            @Valid @RequestBody SeatDto seatDto,
            @PathVariable Long busId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Creating seat for bus: {}", correlationId, busId);

        if (busId == null || busId <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<SeatDto>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid bus ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.createSeatForBus(seatDto, busId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Seat created successfully: seatId={}",
                            correlationId, response.getBusId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<SeatDto>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Seat created successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Seat creation"));
    }

    /**
     * Update seat
     */
    @PutMapping("/seats/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update seat", description = "Update an existing seat. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<SeatDto>>> updateSeat(
            @Valid @RequestBody SeatDto seatDto,
            @PathVariable Long id) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Updating seat: {}", correlationId, id);

        if (id == null || id <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<SeatDto>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid seat ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.updateSeat(seatDto, id)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Seat updated successfully: seatId={}", correlationId, id);
                    return ResponseEntity.ok(
                            Response.<SeatDto>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Seat updated successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Seat update"));
    }

    /**
     * Delete seat
     */
    @DeleteMapping("/seats/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete seat", description = "Delete a seat. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteSeat(
            @PathVariable Long id) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Deleting seat: {}", correlationId, id);

        if (id == null || id <= 0) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid seat ID")
                                    .data(null)
                                    .build()));
        }

        return adminAggregator.deleteSeat(id)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Seat deleted successfully: seatId={}", correlationId, id);
                    return ResponseEntity.ok(
                            Response.<Void>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Seat deleted successfully")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Seat deletion"));
    }

    // ==================== EXCEPTION HANDLING ====================

    /**
     * Centralized exception handling
     */
    private <T> ResponseEntity<Response<T>> handleException(
            Throwable ex, String correlationId, String operation) {

        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        log.error("[{}] {} failed: {}", correlationId, operation, cause.getMessage(), cause);

        if (cause instanceof ValidationException) {
            return ResponseEntity.badRequest().body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.BAD_REQUEST.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build());
        }

        if (cause instanceof ChangeSetPersister.NotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.NOT_FOUND.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build());
        }

        if (cause instanceof BusinessException) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.UNPROCESSABLE_ENTITY.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build());
        }

        if (cause instanceof java.util.concurrent.TimeoutException) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.REQUEST_TIMEOUT.value())
                            .message("Operation timed out. Please try again.")
                            .data(null)
                            .build());
        }

        // Generic error
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Response.<T>builder()
                        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("An unexpected error occurred. Please contact support with correlation ID: "
                                + correlationId)
                        .data(null)
                        .build());
    }
}