package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.RouteDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class RouteServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getAllRoutesFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<RouteDto>> getAllRoutes() {
        return getWebClient().get().uri("/api/route")
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), RouteDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getRouteByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<RouteDto> getRouteById(Integer routeId) {
        return getWebClient().get().uri("/api/route/{id}", routeId)
                .retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), RouteDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<RouteDto> createRouteWithBusStops(
            RouteDto routeDto, Long sourceId, Long destId) {
        return getWebClient().post().uri("/admin/busStopRoute/{id}/{id1}", sourceId, destId)
                .bodyValue(routeDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), RouteDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<Void> deleteRoute(Long routeId) {
        return getWebClient().delete().uri("/admin/deleteRoute/{id}", routeId)
                .retrieve().bodyToMono(Void.class).toFuture();
    }

    public CompletableFuture<List<RouteDto>> getRoutesByBusStop(Integer busStopId) {
        // Mock implementation
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    // Fallbacks
    private CompletableFuture<List<RouteDto>> getAllRoutesFallback(Throwable ex) {
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<RouteDto> getRouteByIdFallback(Integer id, Throwable ex) {
        return CompletableFuture.completedFuture(new RouteDto());
    }

    private <T> T map(Object data, Class<T> clazz) {
        return new com.fasterxml.jackson.databind.ObjectMapper().convertValue(data, clazz);
    }

    private <T> List<T> mapList(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data,
                mapper.getTypeFactory().constructCollectionType(List.class, clazz));
    }
}
