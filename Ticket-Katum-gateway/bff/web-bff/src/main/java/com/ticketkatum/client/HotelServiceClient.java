package com.ticketkatum.client;

import com.ticketkatum.config.WebClientInvoker;
import com.ticketkatum.dto.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service

public class HotelServiceClient extends WebClientInvoker {

    @Qualifier("hotelWebClient")
    @Autowired
    private WebClient webClient;

    private static final String SERVICE = "hotelService";

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackNearby")
    @Retry(name = SERVICE)
    public Mono<GenericResponse<NearbyHotelResponse>> searchNearbyHotels(
            GenericRequest<NearbyHotelRequest> request) {

        return invoke(
                webClient.post()
                        .uri("/api/hotels/nearby")
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<NearbyHotelResponse>>() {}),
                SERVICE,
                "searchNearbyHotels"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackDetails")
    @Cacheable(value = "hotel-details", key = "#hotelId")
    public Mono<GenericResponse<HotelDetailResponse>> getHotelDetails(
            Long hotelId, Double userLat, Double userLon) {

        log.debug("Fetching hotel details | hotel_id={}", hotelId);

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/hotels/{id}")
                                .queryParam("userLat", userLat)
                                .queryParam("userLon", userLon)
                                .build(hotelId))
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<HotelDetailResponse>>() {}),
                SERVICE,
                "getHotelDetails"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackRecommendations")
    @Cacheable(value = "hotel-recommendations", key = "#latitude + '_' + #longitude")
    public Mono<List<HotelRecommendation>> getRecommendations(
            Double latitude, Double longitude, Integer limit) {

        log.debug("Fetching hotel recommendations | lat={} | lon={}", latitude, longitude);

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/hotels/recommendations")
                                .queryParam("latitude", latitude)
                                .queryParam("longitude", longitude)
                                .queryParam("limit", limit)
                                .build())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<List<HotelRecommendation>>>() {}),
                SERVICE,
                "getRecommendations"
        ).map(response -> response.isSuccess() && response.getData() != null ?
                response.getData() : Collections.emptyList());
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackFeatured")
    @Cacheable(value = "featured-hotels", key = "#limit")
    public Mono<List<HotelRecommendation>> getFeaturedHotels(Integer limit) {

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/hotels/featured")
                                .queryParam("limit", limit)
                                .build())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<List<HotelRecommendation>>>() {}),
                SERVICE,
                "getFeaturedHotels"
        ).map(response -> response.isSuccess() && response.getData() != null ?
                response.getData() : Collections.emptyList());
    }

    // Fallback methods
    private Mono<GenericResponse<NearbyHotelResponse>> fallbackNearby(
            GenericRequest<NearbyHotelRequest> req, Throwable ex) {

        log.warn("Hotel search fallback | error={}", ex.getMessage());

        return Mono.just(GenericResponse.success(
                NearbyHotelResponse.builder()
                        .hotels(null)
                        .totalResults(0)
                        .message("Hotel search temporarily unavailable")
                        .build(),
                req.getRequestId()
        ));
    }

    private Mono<GenericResponse<HotelDetailResponse>> fallbackDetails(
            Long hotelId, Double userLat, Double userLon, Throwable ex) {

        log.error("Hotel details fallback | hotel_id={} | error={}",
                hotelId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Hotel details unavailable",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<List<HotelRecommendation>> fallbackRecommendations(
            Double latitude, Double longitude, Integer limit, Throwable ex) {

        log.warn("Hotel recommendations fallback | error={}", ex.getMessage());

        return Mono.just(Collections.emptyList());
    }

    private Mono<List<HotelRecommendation>> fallbackFeatured(
            Integer limit, Throwable ex) {

        log.warn("Featured hotels fallback | error={}", ex.getMessage());

        return Mono.just(Collections.emptyList());
    }
}