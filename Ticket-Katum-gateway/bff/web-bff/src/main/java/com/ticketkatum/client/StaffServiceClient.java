package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
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
public class StaffServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String CIRCUIT_BREAKER_NAME = "staffService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getStaffServiceUrl())
                .build();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getStaffByHotelFallback")
    @Retry(name = "staff-service")
    public CompletableFuture<List<StaffResponse>> getStaffByHotel(Long hotelId) {
        log.debug("Fetching staff for hotel: {}", hotelId);

        return getWebClient()
                .get()
                .uri("/staff/hotel/{hotelId}", hotelId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), StaffResponse.class))
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "staff-service")
    public CompletableFuture<StaffResponse> createStaff(StaffRequest request) {
        log.debug("Creating staff");

        return getWebClient()
                .post()
                .uri("/staff/create")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), StaffResponse.class))
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "staff-service")
    public CompletableFuture<StaffResponse> updateStaffStatus(Long staffId, String status) {
        log.debug("Updating staff status: {} -> {}", staffId, status);

        return getWebClient()
                .put()
                .uri(uriBuilder -> uriBuilder
                        .path("/staff/{id}/status")
                        .queryParam("status", status)
                        .build(staffId))
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), StaffResponse.class))
                .toFuture();
    }

    // Fallback methods
    private CompletableFuture<List<StaffResponse>> getStaffByHotelFallback(
            Long hotelId, Throwable ex) {
        log.warn("Fallback: getStaffByHotel for hotel: {}", hotelId);
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private <T> T objectMapper(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data, clazz);
    }

    private <T> List<T> objectMapperList(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data,
                mapper.getTypeFactory().constructCollectionType(List.class, clazz));
    }
}
