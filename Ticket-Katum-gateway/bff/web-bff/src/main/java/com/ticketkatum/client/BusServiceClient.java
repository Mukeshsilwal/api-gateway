package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.BusDto;
import com.ticketkatum.dto.bus.BusSearchRequest;
import com.ticketkatum.dto.bus.BusSearchResponse;
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
public class BusServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getAllBusesFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<BusDto>> getAllBuses() {
        return getWebClient().get().uri("/bus/route")
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), BusDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getBusByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<BusDto> getBusById(Long busId) {
        return getWebClient().get().uri("/bus/{id}", busId)
                .retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "searchBusesFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<BusSearchResponse> searchBuses(BusSearchRequest request) {
        return getWebClient().post().uri("/bus/search")
                .bodyValue(request).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusSearchResponse.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<BusDto> createBusInRoute(BusDto busDto, Integer routeId) {
        return getWebClient().post().uri("/admin/routeBus/{id}", routeId)
                .bodyValue(busDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<BusDto> updateBus(BusDto busDto, Long busId, Integer routeId) {
        return getWebClient().put().uri("/admin/bus/{id}/route/{routeId}", busId, routeId)
                .bodyValue(busDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<Void> deleteBus(Long busId) {
        return getWebClient().delete().uri("/admin/deleteBus/{id}", busId)
                .retrieve().bodyToMono(Void.class).toFuture();
    }

    public CompletableFuture<List<BusDto>> getBusesByRoute(Integer routeId) {
        // Implement or mock
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    // Fallbacks
    private CompletableFuture<List<BusDto>> getAllBusesFallback(Throwable ex) {
        log.warn("Fallback: getAllBuses");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<BusDto> getBusByIdFallback(Long busId, Throwable ex) {
        log.warn("Fallback: getBusById");
        return CompletableFuture.completedFuture(new BusDto());
    }

    private CompletableFuture<BusSearchResponse> searchBusesFallback(BusSearchRequest req, Throwable ex) {
        log.warn("Fallback: searchBuses");
        return CompletableFuture.completedFuture(new BusSearchResponse());
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

