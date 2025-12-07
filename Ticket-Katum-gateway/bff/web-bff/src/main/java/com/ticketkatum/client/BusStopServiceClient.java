package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.BusStopDto;
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
public class BusStopServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getAllBusStopsFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<BusStopDto>> getAllBusStops() {
        return getWebClient().get().uri("/busStop/get")
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), BusStopDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getBusStopByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<BusStopDto> getBusStopById(Integer busStopId) {
        return getWebClient().get().uri("/busStop/get/{id}", busStopId)
                .retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusStopDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<BusStopDto> createBusStop(BusStopDto busStopDto) {
        return getWebClient().post().uri("/admin/post")
                .bodyValue(busStopDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusStopDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<BusStopDto> updateBusStop(BusStopDto busStopDto, Long busStopId) {
        return getWebClient().put().uri("/admin/updateBusStop/{id}", busStopId)
                .bodyValue(busStopDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BusStopDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<Void> deleteBusStop(Long busStopId) {
        return getWebClient().delete().uri("/admin/deleteBusStop/{id}", busStopId)
                .retrieve().bodyToMono(Void.class).toFuture();
    }

    // Fallbacks
    private CompletableFuture<List<BusStopDto>> getAllBusStopsFallback(Throwable ex) {
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<BusStopDto> getBusStopByIdFallback(Integer id, Throwable ex) {
        return CompletableFuture.completedFuture(new BusStopDto());
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

