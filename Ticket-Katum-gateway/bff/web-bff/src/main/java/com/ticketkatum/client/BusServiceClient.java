package com.ticketkatum.client;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.BusDto;
import com.ticketkatum.dto.bus.BusStopDto;
import com.ticketkatum.dto.bus.RouteDto;
import com.ticketkatum.dto.bus.SeatDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.naming.ServiceUnavailableException;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Production-ready Bus Service Client
 * Features:
 * - Circuit breaker pattern
 * - Retry mechanism
 * - Timeout handling
 * - Comprehensive error handling
 * - Structured logging
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BusServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.bus-service.url}")
    private String busServiceUrl;

    @Value("${services.bus-service.timeout:5000}")
    private int timeout;

    private static final String SERVICE_NAME = "bus-service";
    private static final String CIRCUIT_BREAKER_NAME = "busService";

    // ==================== Bus Operations ====================

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "createBusFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<BusDto> createBus(BusDto busDto) {
        log.info("Creating bus: {}", busDto.getBusName());

        return webClientBuilder.build()
                .post()
                .uri(busServiceUrl + "/api/v1/buses")
                .bodyValue(busDto)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<BusDto>>() {})
                .map(Response::getData)
                .doOnSuccess(bus -> log.info("Bus created successfully: {}", bus.getId()))
                .doOnError(error -> log.error("Failed to create bus: {}", error.getMessage()))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getBusFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<BusDto> getBusById(Long busId) {
        log.info("Fetching bus by ID: {}", busId);

        return webClientBuilder.build()
                .get()
                .uri(busServiceUrl + "/api/v1/buses/{id}", busId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<BusDto>>() {})
                .map(Response::getData)
                .doOnSuccess(bus -> log.debug("Bus retrieved: {}", bus.getId()))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "updateBusFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<BusDto> updateBus(Long busId, BusDto busDto) {
        log.info("Updating bus: {}", busId);

        return webClientBuilder.build()
                .put()
                .uri(busServiceUrl + "/api/v1/buses/{id}", busId)
                .bodyValue(busDto)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<BusDto>>() {})
                .map(Response::getData)
                .doOnSuccess(bus -> log.info("Bus updated successfully: {}", bus.getId()))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "deleteBusFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<Void> deleteBus(Long busId) {
        log.info("Deleting bus: {}", busId);

        return webClientBuilder.build()
                .delete()
                .uri(busServiceUrl + "/api/v1/buses/{id}", busId)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("Bus deleted successfully: {}", busId))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getAllBusesFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<List<BusDto>> getAllBuses() {
        log.info("Fetching all buses");

        return webClientBuilder.build()
                .get()
                .uri(busServiceUrl + "/api/v1/buses")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<BusDto>>>() {})
                .map(Response::getData)
                .doOnSuccess(buses -> log.debug("Retrieved {} buses", buses.size()))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    // ==================== Seat Operations ====================

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "generateSeatsFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<List<SeatDto>> generateSeats(Long busId, Integer numberOfSeats) {
        log.info("Generating {} seats for bus: {}", numberOfSeats, busId);

        return webClientBuilder.build()
                .post()
                .uri(busServiceUrl + "/api/v1/buses/{busId}/seats/generate?numberOfSeats={count}",
                        busId, numberOfSeats)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<SeatDto>>>() {})
                .map(Response::getData)
                .doOnSuccess(seats -> log.info("Generated {} seats for bus {}", seats.size(), busId))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getSeatsFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<List<SeatDto>> getSeatsByBus(Long busId) {
        log.info("Fetching seats for bus: {}", busId);

        return webClientBuilder.build()
                .get()
                .uri(busServiceUrl + "/api/v1/buses/{busId}/seats", busId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<SeatDto>>>() {})
                .map(Response::getData)
                .doOnSuccess(seats -> log.debug("Retrieved {} seats for bus {}", seats.size(), busId))
                .onErrorMap(this::mapError)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "deleteAllSeatsFallback")
    @Retry(name = CIRCUIT_BREAKER_NAME)
    @TimeLimiter(name = CIRCUIT_BREAKER_NAME)
    public CompletableFuture<Integer> deleteAllSeats(Long busId) {
        log.info("Deleting all seats for bus: {}", busId);

        return webClientBuilder.build()
                .delete()
                .uri(busServiceUrl + "/api/v1/buses/{busId}/seats", busId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Integer>>() {})
                .map(Response::getData)
                .doOnSuccess(count -> log.info("Deleted {} seats for bus {}", count, busId))
                .onErrorMap(this::mapError)
                .toFuture();
    }
    private CompletableFuture<BusDto> createBusFallback(BusDto busDto, Exception ex) {
        log.error("Fallback triggered for createBus", ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<BusDto> getBusFallback(Long busId, Exception ex) {
        log.error("Fallback triggered for getBus: {}", busId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<BusDto> updateBusFallback(Long busId, BusDto busDto, Exception ex) {
        log.error("Fallback triggered for updateBus: {}", busId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<Void> deleteBusFallback(Long busId, Exception ex) {
        log.error("Fallback triggered for deleteBus: {}", busId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<List<BusDto>> getAllBusesFallback(Exception ex) {
        log.error("Fallback triggered for getAllBuses", ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<List<SeatDto>> generateSeatsFallback(Long busId, Integer numberOfSeats, Exception ex) {
        log.error("Fallback triggered for generateSeats: bus={}, seats={}", busId, numberOfSeats, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<List<SeatDto>> getSeatsFallback(Long busId, Exception ex) {
        log.error("Fallback triggered for getSeats: {}", busId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<Integer> deleteAllSeatsFallback(Long busId, Exception ex) {
        log.error("Fallback triggered for deleteAllSeats: {}", busId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<RouteDto> createRouteFallback(RouteDto routeDto, Exception ex) {
        log.error("Fallback triggered for createRoute", ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<RouteDto> getRouteFallback(Long routeId, Exception ex) {
        log.error("Fallback triggered for getRoute: {}", routeId, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<List<RouteDto>> searchRoutesFallback(String source, String destination, LocalDate date, Exception ex) {
        log.error("Fallback triggered for searchRoutes: {} to {} on {}", source, destination, date, ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<BusStopDto> createBusStopFallback(BusStopDto busStopDto, Exception ex) {
        log.error("Fallback triggered for createBusStop", ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    private CompletableFuture<List<BusStopDto>> getBusStopsFallback(Exception ex) {
        log.error("Fallback triggered for getBusStops", ex);
        return CompletableFuture.failedFuture(
                new ServiceUnavailableException(SERVICE_NAME));
    }

    // ==================== Error Mapping ====================

    private Throwable mapError(Throwable throwable) {
        if (throwable instanceof WebClientResponseException webEx) {
            log.error("WebClient error: status={}, body={}",
                    webEx.getStatusCode(), webEx.getResponseBodyAsString());
            return new ServiceUnavailableException(SERVICE_NAME
            );
        }
        return throwable;
    }
}