package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.HotelFilterOptions;
import com.ticketkatum.dto.hotel.HotelRecommendation;
import com.ticketkatum.dto.hotel.request.HotelAvailabilityRequest;
import com.ticketkatum.dto.hotel.request.HotelSearchRequest;
import com.ticketkatum.dto.hotel.request.NearbyHotelRequest;
import com.ticketkatum.dto.hotel.request.NearbyHotelResponse;
import com.ticketkatum.dto.hotel.response.HotelAvailabilityResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Client for Hotel Recommendation Microservice
 * Handles search, recommendations, and geospatial queries
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String SERVICE_NAME = "recommendation-service";
    private static final String CIRCUIT_BREAKER_NAME = "recommendationService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getRecommendationServiceUrl())
                .build();
    }

    /**
     * Find nearby hotels using geospatial search
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "findNearbyHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> findNearbyHotels(
            Double latitude, Double longitude, Double radiusKm) {

        log.debug("Finding nearby hotels - lat: {}, lon: {}, radius: {}km",
                latitude, longitude, radiusKm);

        NearbyHotelRequest request = NearbyHotelRequest.builder()
                .latitude(latitude)
                .longitude(longitude)
                .radiusKm(radiusKm)
                .limit(20)
                .build();

        return getWebClient()
                .post()
                .uri("/api/v1/find/nearby")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(NearbyHotelResponse.class)
                .map(NearbyHotelResponse::getHotels)
                .toFuture();
    }

    /**
     * Get hotel recommendation by ID with distance calculation
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getHotelRecommendationFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelRecommendation> getHotelRecommendation(
            Long hotelId, Double userLat, Double userLon) {

        log.debug("Getting hotel recommendation for ID: {}", hotelId);

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v1/find/{id}").build(hotelId);
                    if (userLat != null) builder = uriBuilder.queryParam("userLat", userLat).build(hotelId);
                    if (userLon != null) builder = uriBuilder.queryParam("userLon", userLon).build(hotelId);
                    return builder;
                })
                .retrieve()
                .bodyToMono(HotelRecommendation.class)
                .toFuture();
    }

    /**
     * Get personalized hotel recommendations for a user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getPersonalizedRecommendationsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> getPersonalizedRecommendations(
            String userId, Double latitude, Double longitude, Integer limit) {

        log.debug("Getting personalized recommendations for user: {}", userId);

        return getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/find/personalized")
                        .queryParam("userId", userId)
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Get featured hotels
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getFeaturedHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> getFeaturedHotels(Integer limit) {
        log.debug("Getting featured hotels");

        return getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/find/featured")
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Search hotels by city
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "searchByCityFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> searchByCity(
            String city, Double userLat, Double userLon, Integer limit) {

        log.debug("Searching hotels in city: {}", city);

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/v1/find/city/{city}")
                            .queryParam("limit", limit);
                    if (userLat != null) builder.queryParam("userLat", userLat);
                    if (userLon != null) builder.queryParam("userLon", userLon);
                    return builder.build(city);
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Advanced hotel search with multiple filters
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "advancedSearchFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> advancedSearch(
            HotelSearchRequest searchRequest) {

        log.debug("Advanced search: {}", searchRequest);

        return getWebClient()
                .post()
                .uri("/api/v1/find/search")
                .bodyValue(searchRequest)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Get top-rated hotels
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getTopRatedHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> getTopRatedHotels(
            Integer limit, Double userLat, Double userLon) {

        log.debug("Getting top-rated hotels");

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/v1/find/top-rated")
                            .queryParam("limit", limit);
                    if (userLat != null) builder.queryParam("userLat", userLat);
                    if (userLon != null) builder.queryParam("userLon", userLon);
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Get budget hotels within price range
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getBudgetHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> getBudgetHotels(
            BigDecimal maxPrice, String city, Integer limit, Double userLat, Double userLon) {

        log.debug("Getting budget hotels with max price: {}", maxPrice);

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/v1/find/budget")
                            .queryParam("maxPrice", maxPrice)
                            .queryParam("limit", limit);
                    if (city != null) builder.queryParam("city", city);
                    if (userLat != null) builder.queryParam("userLat", userLat);
                    if (userLon != null) builder.queryParam("userLon", userLon);
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Get hotels by star rating
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getHotelsByStarRatingFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelRecommendation>> getHotelsByStarRating(
            Integer stars, String city, Integer limit, Double userLat, Double userLon) {

        log.debug("Getting {}-star hotels", stars);

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/api/v1/find/star-rating/{stars}")
                            .queryParam("limit", limit);
                    if (city != null) builder.queryParam("city", city);
                    if (userLat != null) builder.queryParam("userLat", userLat);
                    if (userLon != null) builder.queryParam("userLon", userLon);
                    return builder.build(stars);
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelRecommendation.class))
                .toFuture();
    }

    /**
     * Get available cities with hotels
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getAvailableCitiesFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<String>> getAvailableCities() {
        log.debug("Getting available cities");

        return getWebClient()
                .get()
                .uri("/api/v1/find/cities")
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), String.class))
                .toFuture();
    }

    /**
     * Check hotel availability for specific dates
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "checkAvailabilityFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelAvailabilityResponse> checkAvailability(
            Long hotelId, LocalDate checkIn, LocalDate checkOut, List<Long> roomIds) {

        log.debug("Checking availability for hotel: {}", hotelId);

        HotelAvailabilityRequest request = HotelAvailabilityRequest.builder()
                .checkIn(checkIn)
                .checkOut(checkOut)
                .roomIds(roomIds)
                .build();

        return getWebClient()
                .post()
                .uri("/api/v1/find/{id}/availability", hotelId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(HotelAvailabilityResponse.class)
                .toFuture();
    }

    /**
     * Get filter options for hotel search
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getFilterOptionsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelFilterOptions> getFilterOptions() {
        log.debug("Getting filter options");

        return getWebClient()
                .get()
                .uri("/api/v1/find/filters")
                .retrieve()
                .bodyToMono(HotelFilterOptions.class)
                .toFuture();
    }

    /**
     * Invalidate cache for specific hotel
     */
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Void> invalidateHotelCache(Long hotelId) {
        log.debug("Invalidating cache for hotel: {}", hotelId);

        return getWebClient()
                .post()
                .uri("/api/v1/find/cache/invalidate/{hotelId}", hotelId)
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }

    /**
     * Clear all caches
     */
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Void> clearAllCaches() {
        log.debug("Clearing all caches");

        return getWebClient()
                .post()
                .uri("/api/v1/find/cache/clear")
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }

    // ============ Fallback Methods ============

    private CompletableFuture<List<HotelRecommendation>> findNearbyHotelsFallback(
            Double latitude, Double longitude, Double radiusKm, Throwable ex) {
        log.warn("Fallback: findNearbyHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<HotelRecommendation> getHotelRecommendationFallback(
            Long hotelId, Double userLat, Double userLon, Throwable ex) {
        log.warn("Fallback: getHotelRecommendation for ID: {}", hotelId);
        return CompletableFuture.completedFuture(
                HotelRecommendation.builder()
                        .id(hotelId)
                        .name("Hotel recommendation temporarily unavailable")
                        .build()
        );
    }

    private CompletableFuture<List<HotelRecommendation>> getPersonalizedRecommendationsFallback(
            String userId, Double latitude, Double longitude, Integer limit, Throwable ex) {
        log.warn("Fallback: getPersonalizedRecommendations");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> getFeaturedHotelsFallback(
            Integer limit, Throwable ex) {
        log.warn("Fallback: getFeaturedHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> searchByCityFallback(
            String city, Double userLat, Double userLon, Integer limit, Throwable ex) {
        log.warn("Fallback: searchByCity for: {}", city);
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> advancedSearchFallback(
            HotelSearchRequest searchRequest, Throwable ex) {
        log.warn("Fallback: advancedSearch");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> getTopRatedHotelsFallback(
            Integer limit, Double userLat, Double userLon, Throwable ex) {
        log.warn("Fallback: getTopRatedHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> getBudgetHotelsFallback(
            BigDecimal maxPrice, String city, Integer limit, Double userLat, Double userLon, Throwable ex) {
        log.warn("Fallback: getBudgetHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelRecommendation>> getHotelsByStarRatingFallback(
            Integer stars, String city, Integer limit, Double userLat, Double userLon, Throwable ex) {
        log.warn("Fallback: getHotelsByStarRating");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<String>> getAvailableCitiesFallback(Throwable ex) {
        log.warn("Fallback: getAvailableCities");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<HotelAvailabilityResponse> checkAvailabilityFallback(
            Long hotelId, LocalDate checkIn, LocalDate checkOut, List<Long> roomIds, Throwable ex) {
        log.warn("Fallback: checkAvailability for hotel: {}", hotelId);
        return CompletableFuture.completedFuture(
                HotelAvailabilityResponse.builder()
                        .hotelId(hotelId)
                        .available(false)
                        .message("Availability check temporarily unavailable")
                        .build()
        );
    }

    private CompletableFuture<HotelFilterOptions> getFilterOptionsFallback(Throwable ex) {
        log.warn("Fallback: getFilterOptions");
        return CompletableFuture.completedFuture(new HotelFilterOptions());
    }

    // Helper methods
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
