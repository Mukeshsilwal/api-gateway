package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.request.RoomMaintenanceRequest;
import com.ticketkatum.dto.hotel.response.RoomMaintenanceResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class MaintenanceServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String CIRCUIT_BREAKER_NAME = "maintenanceService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getMaintenanceServiceUrl())
                .build();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "createOrUpdateFallback")
    @Retry(name = "maintenance-service")
    public CompletableFuture<RoomMaintenanceResponse> createOrUpdate(
            RoomMaintenanceRequest request) {

        log.debug("Creating/updating maintenance for room: {}", request.getRoomId());

        return getWebClient()
                .post()
                .uri("/maintenance/save")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomMaintenanceResponse.class))
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "assignStaffFallback")
    @Retry(name = "maintenance-service")
    public CompletableFuture<RoomMaintenanceResponse> assignStaff(
            Long maintenanceId, String staffName) {

        log.debug("Assigning staff to maintenance: {}", maintenanceId);

        return getWebClient()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path("/maintenance/assign/{maintenanceId}")
                        .queryParam("staffName", staffName)
                        .build(maintenanceId))
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomMaintenanceResponse.class))
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getMaintenanceByRoomIdFallback")
    @Retry(name = "maintenance-service")
    public CompletableFuture<RoomMaintenanceResponse> getMaintenanceByRoomId(Long roomId) {
        log.debug("Fetching maintenance for room: {}", roomId);

        return getWebClient()
                .get()
                .uri("/maintenance/room/{roomId}", roomId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomMaintenanceResponse.class))
                .toFuture();
    }

    // Fallback methods
    private CompletableFuture<RoomMaintenanceResponse> createOrUpdateFallback(
            RoomMaintenanceRequest request, Throwable ex) {
        log.warn("Fallback: createOrUpdate for room: {}", request.getRoomId());
        return CompletableFuture.completedFuture(null);
    }

    private CompletableFuture<RoomMaintenanceResponse> assignStaffFallback(
            Long maintenanceId, String staffName, Throwable ex) {
        log.warn("Fallback: assignStaff");
        return CompletableFuture.completedFuture(null);
    }

    private CompletableFuture<RoomMaintenanceResponse> getMaintenanceByRoomIdFallback(
            Long roomId, Throwable ex) {
        log.warn("Fallback: getMaintenanceByRoomId for room: {}", roomId);
        return CompletableFuture.completedFuture(null);
    }

    private <T> T objectMapper(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data, clazz);
    }
}
