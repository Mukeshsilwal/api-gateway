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
 * Admin BFF Controller
 * Handles admin operations with cascading effects
 * Requires ADMIN role for all operations
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin BFF", description = "Admin management aggregated APIs")
@SecurityRequirement(name = "bearer-jwt")
public class AdminBffController {

    private final AdminAggregator adminAggregator;
    private static final long OPERATION_TIMEOUT_SECONDS = 30;

    /**
     * Create bus with seats
     * Aggregates: bus creation, seat generation
     */
//    @PostMapping("/buses/create-with-seats")
//    @PreAuthorize("hasRole('ADMIN')")
//    @Operation(summary = "Create bus with seats",
//            description = "Create bus and generate seats in one operation. Requires ADMIN role.")
//    public CompletableFuture<ResponseEntity<Response<BusCreationResponse>>> createBusWithSeats(
//            @Valid @RequestBody BusCreationRequest request) {
//
//        String correlationId = UUID.randomUUID().toString();
//        log.info("[{}] BFF: Creating bus with {} seats for route: {}",
//                correlationId, request.getNumberOfSeats(), request.getRouteId());
//
//        // Input validation
//        if (request.getNumberOfSeats() == null || request.getNumberOfSeats() <= 0) {
//            log.warn("[{}] Invalid seat count: {}", correlationId, request.getNumberOfSeats());
//            return CompletableFuture.completedFuture(
//                    ResponseEntity.badRequest().body(
//                            Response.<BusCreationResponse>builder()
//                                    .statusCode(HttpStatus.BAD_REQUEST.value())
//                                    .message("Number of seats must be greater than 0")
//                                    .data(null)
//                                    .build()
//                    )
//            );
//        }
//
//        if (request.getNumberOfSeats() > 100) {
//            log.warn("[{}] Seat count exceeds maximum: {}", correlationId, request.getNumberOfSeats());
//            return CompletableFuture.completedFuture(
//                    ResponseEntity.badRequest().body(
//                            Response.<BusCreationResponse>builder()
//                                    .statusCode(HttpStatus.BAD_REQUEST.value())
//                                    .message("Number of seats cannot exceed 100")
//                                    .data(null)
//                                    .build()
//                    )
//            );
//        }
//
//        return adminAggregator.createBusWithSeats(
//                        request.getBusDto(),
//                        request.getRouteId(),
//                        request.getNumberOfSeats()
//                )
//                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
//                .thenApply(response -> {
//                    log.info("[{}] Bus created successfully: busId={}",
//                            correlationId, response.getBus().getId());
//                    return ResponseEntity.status(HttpStatus.CREATED).body(
//                            Response.<BusCreationResponse>builder()
//                                    .statusCode(HttpStatus.CREATED.value())
//                                    .message("Bus and seats created successfully")
//                                    .data(response)
//                                    .build()
//                    );
//                })
//                .exceptionally(ex -> handleException(ex, correlationId, "Bus creation"));
//    }

    /**
     * Delete bus with all seats
     * Aggregates: seat deletion, bus deletion
     */
    @DeleteMapping("/buses/{busId}/with-seats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bus with seats",
            description = "Delete bus and all associated seats. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<DeletionResponse>>> deleteBusWithSeats(
            @PathVariable Long busId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Deleting bus and seats: {}", correlationId, busId);

        // Input validation
        if (busId == null || busId <= 0) {
            log.warn("[{}] Invalid bus ID: {}", correlationId, busId);
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<DeletionResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Invalid bus ID")
                                    .data(null)
                                    .build()
                    )
            );
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
                                    .build()
                    );
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Bus deletion"));
    }

    /**
     * Create route with bus stops
     * Aggregates: route creation with source and destination stops
     */
    @PostMapping("/routes/create-with-stops")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create route with stops",
            description = "Create route with bus stops. Requires ADMIN role.")
    public CompletableFuture<ResponseEntity<Response<RouteCreationResponse>>> createRouteWithStops(
            @Valid @RequestBody RouteCreationRequest request) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Creating route with stops: {} to {}",
                correlationId, request.getSourceStopId(), request.getDestinationStopId());

        // Input validation
        if (request.getSourceStopId() == null || request.getDestinationStopId() == null) {
            log.warn("[{}] Missing stop IDs", correlationId);
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Source and destination stop IDs are required")
                                    .data(null)
                                    .build()
                    )
            );
        }

        if (request.getSourceStopId().equals(request.getDestinationStopId())) {
            log.warn("[{}] Source and destination stops are the same: {}",
                    correlationId, request.getSourceStopId());
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.BAD_REQUEST.value())
                                    .message("Source and destination stops must be different")
                                    .data(null)
                                    .build()
                    )
            );
        }

        return adminAggregator.createRouteWithBusStops(
                        request.getRouteDto(),
                        request.getSourceStopId(),
                        request.getDestinationStopId()
                )
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Route created successfully: routeId={}",
                            correlationId, response.getRoute().getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<RouteCreationResponse>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Route created successfully")
                                    .data(response)
                                    .build()
                    );
                })
                .exceptionally(ex -> handleException(ex, correlationId, "Route creation"));
    }

    /**
     * Centralized exception handling
     */
    private <T> ResponseEntity<Response<T>> handleException(
            Throwable ex, String correlationId, String operation) {

        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;

        log.error("[{}] {} failed: {}", correlationId, operation, cause.getMessage(), cause);

        // Handle specific exceptions
        if (cause instanceof ValidationException) {
            return ResponseEntity.badRequest().body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.BAD_REQUEST.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build()
            );
        }

        if (cause instanceof ChangeSetPersister.NotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.NOT_FOUND.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build()
            );
        }

        if (cause instanceof BusinessException) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.UNPROCESSABLE_ENTITY.value())
                            .message(cause.getMessage())
                            .data(null)
                            .build()
            );
        }

        if (cause instanceof java.util.concurrent.TimeoutException) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(
                    Response.<T>builder()
                            .statusCode(HttpStatus.REQUEST_TIMEOUT.value())
                            .message("Operation timed out. Please try again.")
                            .data(null)
                            .build()
            );
        }

        // Generic error
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Response.<T>builder()
                        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("An unexpected error occurred. Please contact support with correlation ID: " + correlationId)
                        .data(null)
                        .build()
        );
    }
}