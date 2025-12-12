package com.ticketkatum.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.HotelDTO;
import com.ticketkatum.dto.hotel.HotelSearchCriteria;
import com.ticketkatum.dto.hotel.RoomDTO;
import com.ticketkatum.dto.hotel.request.CreateHotelRequest;
import com.ticketkatum.dto.hotel.request.CreateRoomRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Client for Hotel Management Microservice
 * Handles all hotel and room-related operations
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HotelServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;
    @Autowired
    private ObjectMapper objectMapper;


    private static final String SERVICE_NAME = "hotel-service";
    private static final String CIRCUIT_BREAKER_NAME = "hotelService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getHotelServiceUrl())
                .build();
    }

    /**
     * Get hotel by ID
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getHotelByIdFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelDTO> getHotelById(Long hotelId) {
        log.debug("Fetching hotel by ID: {}", hotelId);

        return getWebClient()
                .get()
                .uri("/api/v1/hotels/{hotelId}", hotelId)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals,
                        response -> Mono.error(new RuntimeException("Hotel not found: " + hotelId)))
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HotelDTO.class))
                .toFuture()
                .exceptionally(ex -> {
                    log.error("Error fetching hotel {}", hotelId, ex);
                    throw new RuntimeException("Failed to fetch hotel", ex);
                });
    }

    /**
     * Get hotel by code
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getHotelByCodeFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelDTO> getHotelByCode(String hotelCode) {
        log.debug("Fetching hotel by code: {}", hotelCode);

        return getWebClient()
                .get()
                .uri("/api/v1/hotels/code/{hotelCode}", hotelCode)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HotelDTO.class))
                .toFuture();
    }

    /**
     * Get all hotels with optional filters
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getAllHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelDTO>> getAllHotels() {

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v1/hotels");
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelDTO.class))
                .toFuture();
    }

    /**
     * Search hotels by criteria
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "searchHotelsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<HotelDTO>> searchHotels(HotelSearchCriteria criteria) {
        log.debug("Searching hotels with criteria: {}", criteria);

        return getWebClient()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v1/hotels");
                    if (criteria.getCity() != null)
                        builder.queryParam("city", criteria.getCity());
                    if (criteria.getMinStars() != null)
                        builder.queryParam("minStars", criteria.getMinStars());
                    return builder.build();
                })
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), HotelDTO.class))
                .toFuture();
    }

    /**
     * Create new hotel
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelDTO> createHotel(CreateHotelRequest request) {
        log.debug("Creating hotel: {}", request.getName());

        return getWebClient()
                .post()
                .uri("/api/v1/hotels")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HotelDTO.class))
                .toFuture();
    }

    /**
     * Update hotel
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HotelDTO> updateHotel(Long hotelId, CreateHotelRequest request) {
        log.debug("Updating hotel: {}", hotelId);

        return getWebClient()
                .put()
                .uri("/api/v1/hotels/{hotelId}", hotelId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HotelDTO.class))
                .toFuture();
    }

    /**
     * Delete hotel
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Void> deleteHotel(Long hotelId) {
        log.debug("Deleting hotel: {}", hotelId);

        return getWebClient()
                .delete()
                .uri("/api/v1/hotels/{hotelId}", hotelId)
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }

    /**
     * Get rooms by hotel ID
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRoomsByHotelIdFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<RoomDTO>> getRoomsByHotelId(Long hotelId) {
        log.debug("Fetching rooms for hotel: {}", hotelId);

        // First get hotel by ID to get hotel code
        return getHotelById(hotelId)
                .thenCompose(hotel -> getRoomsByHotelCode(hotel.getHotelCode()));
    }

    /**
     * Get rooms by hotel code
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRoomsByHotelCodeFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<RoomDTO>> getRoomsByHotelCode(String hotelCode) {
        log.debug("Fetching rooms for hotel code: {}", hotelCode);

        return getWebClient()
                .get()
                .uri("/api/v1/hotels/{hotelCode}/rooms", hotelCode)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), RoomDTO.class))
                .toFuture();
    }

    /**
     * Get rooms by multiple room IDs
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRoomsByIdsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<RoomDTO>> getRoomsByIds(List<Long> roomIds) {
        log.debug("Fetching rooms by IDs: {}", roomIds);

        // Fetch rooms individually and combine
        List<CompletableFuture<RoomDTO>> futures = roomIds.stream()
                .map(this::getRoomById)
                .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .toList());
    }

    /**
     * Get room by ID
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRoomByIdFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<RoomDTO> getRoomById(Long roomId) {
        log.debug("Fetching room by ID: {}", roomId);

        return getWebClient()
                .get()
                .uri("/api/v1/hotels/rooms/{roomId}", roomId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomDTO.class))
                .toFuture();
    }

    /**
     * Add room to hotel
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<RoomDTO> addRoom(String hotelCode, CreateRoomRequest request) {
        log.debug("Adding room to hotel: {}", hotelCode);

        return getWebClient()
                .post()
                .uri("/api/v1/hotels/{hotelCode}/rooms", hotelCode)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomDTO.class))
                .toFuture();
    }

    /**
     * Update room
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<RoomDTO> updateRoom(Long roomId, CreateRoomRequest request) {
        log.debug("Updating room: {}", roomId);

        return getWebClient()
                .put()
                .uri("/api/v1/hotels/rooms/{roomId}", roomId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RoomDTO.class))
                .toFuture();
    }

    /**
     * Delete room
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Void> deleteRoom(Long roomId) {
        log.debug("Deleting room: {}", roomId);

        return getWebClient()
                .delete()
                .uri("/api/v1/hotels/rooms/{roomId}", roomId)
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }



    // ============ Fallback Methods ============

    private CompletableFuture<HotelDTO> getHotelByIdFallback(Long hotelId, Throwable ex) {
        log.warn("Fallback: getHotelById for ID: {}", hotelId);
        return CompletableFuture.completedFuture(HotelDTO.builder()
                .id(hotelId)
                .name("Hotel information temporarily unavailable")
                .build());
    }

    private CompletableFuture<HotelDTO> getHotelByCodeFallback(String hotelCode, Throwable ex) {
        log.warn("Fallback: getHotelByCode for code: {}", hotelCode);
        return CompletableFuture.completedFuture(HotelDTO.builder()
                .hotelCode(hotelCode)
                .name("Hotel information temporarily unavailable")
                .build());
    }

    private CompletableFuture<List<HotelDTO>> getAllHotelsFallback(String city, Integer minStars, Throwable ex) {
        log.warn("Fallback: getAllHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<HotelDTO>> searchHotelsFallback(HotelSearchCriteria criteria, Throwable ex) {
        log.warn("Fallback: searchHotels");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<RoomDTO>> getRoomsByHotelIdFallback(Long hotelId, Throwable ex) {
        log.warn("Fallback: getRoomsByHotelId for ID: {}", hotelId);
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<RoomDTO>> getRoomsByHotelCodeFallback(String hotelCode, Throwable ex) {
        log.warn("Fallback: getRoomsByHotelCode for code: {}", hotelCode);
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<List<RoomDTO>> getRoomsByIdsFallback(List<Long> roomIds, Throwable ex) {
        log.warn("Fallback: getRoomsByIds");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<RoomDTO> getRoomByIdFallback(Long roomId, Throwable ex) {
        log.warn("Fallback: getRoomById for ID: {}", roomId);
        return CompletableFuture.completedFuture(RoomDTO.builder()
                .id(roomId)
                .roomNumber("N/A")
                .build());
    }

    private <T> T objectMapper(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();

        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper.convertValue(data, clazz);
    }

    private <T> List<T> objectMapperList(Object data, Class<T> clazz) {
        return objectMapper.convertValue(
                data,
                objectMapper.getTypeFactory().constructCollectionType(List.class, clazz)
        );
    }

}