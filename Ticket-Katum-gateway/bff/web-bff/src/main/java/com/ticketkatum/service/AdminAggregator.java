package com.ticketkatum.service;

import com.ticketkatum.client.BusServiceClient;
import com.ticketkatum.client.BusStopServiceClient;
import com.ticketkatum.client.RouteServiceClient;
import com.ticketkatum.client.SeatServiceClient;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Admin Domain Aggregator
 * Handles admin operations with cascading effects
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAggregator {

    private final BusServiceClient busClient;
    private final RouteServiceClient routeClient;
    private final BusStopServiceClient busStopClient;
    private final SeatServiceClient seatClient;

    /**
     * Create bus with seats
     */
    public CompletableFuture<BusCreationResponse> createBusWithSeats(
            BusDto busDto, Integer routeId, Integer numberOfSeats) {

        log.info("Creating bus with {} seats for route: {}", numberOfSeats, routeId);

        return busClient.createBusInRoute(busDto, routeId)
                .thenCompose(createdBus -> {
                    // Create seats for the bus
                    return seatClient.createSeatsForBus(createdBus.getId(), numberOfSeats)
                            .thenApply(seats ->
                                    BusCreationResponse.builder()
                                            .bus(createdBus)
                                            .seatsCreated(seats.size())
                                            .routeId(routeId)
                                            .message("Bus and seats created successfully")
                                            .build()
                            );
                })
                .exceptionally(ex -> {
                    log.error("Error creating bus with seats", ex);
                    throw new AggregationException("Bus creation failed", ex);
                });
    }

    /**
     * Delete bus with all seats
     */
    public CompletableFuture<DeletionResponse> deleteBusWithSeats(Long busId) {
        log.info("Deleting bus and all seats: {}", busId);

        // First get all seats
        return seatClient.getSeatsByBusId(busId)
                .thenCompose(seats -> {
                    // Delete all seats first
                    CompletableFuture<?>[] deleteFutures = seats.stream()
                            .map(seat -> seatClient.deleteSeat(seat.getId()))
                            .toArray(CompletableFuture[]::new);

                    return CompletableFuture.allOf(deleteFutures)
                            .thenCompose(v -> {
                                // Then delete the bus
                                return busClient.deleteBus(busId)
                                        .thenApply(vv ->
                                                DeletionResponse.builder()
                                                        .success(true)
                                                        .message("Bus and " + seats.size() + " seats deleted")
                                                        .seatsDeleted(seats.size())
                                                        .build()
                                        );
                            });
                })
                .exceptionally(ex -> {
                    log.error("Error deleting bus with seats", ex);
                    return DeletionResponse.builder()
                            .success(false)
                            .message("Deletion failed: " + ex.getMessage())
                            .build();
                });
    }

    /**
     * Create route with bus stops
     */
    public CompletableFuture<RouteCreationResponse> createRouteWithBusStops(
            RouteDto routeDto, Long sourceStopId, Long destinationStopId) {

        log.info("Creating route with stops: {} to {}", sourceStopId, destinationStopId);

        return routeClient.createRouteWithBusStops(routeDto, sourceStopId, destinationStopId)
                .thenCompose(route -> {
                    // Fetch the bus stops
                    CompletableFuture<BusStopDto> sourceFuture =
                            busStopClient.getBusStopById(sourceStopId.intValue());
                    CompletableFuture<BusStopDto> destFuture =
                            busStopClient.getBusStopById(destinationStopId.intValue());

                    return CompletableFuture.allOf(sourceFuture, destFuture)
                            .thenApply(v ->
                                    RouteCreationResponse.builder()
                                            .route(route)
                                            .sourceStop(sourceFuture.join())
                                            .destinationStop(destFuture.join())
                                            .message("Route created successfully")
                                            .build()
                            );
                })
                .exceptionally(ex -> {
                    log.error("Error creating route", ex);
                    throw new AggregationException("Route creation failed", ex);
                });
    }
}
