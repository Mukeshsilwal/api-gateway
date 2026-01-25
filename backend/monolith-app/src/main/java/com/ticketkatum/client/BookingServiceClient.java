package com.ticketkatum.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.request.HotelBookingRequest;
import com.ticketkatum.dto.hotel.request.RefundRequest;
import com.ticketkatum.dto.hotel.response.BookingResponse;
import com.ticketkatum.dto.hotel.response.CancellationResponse;
import com.ticketkatum.dto.hotel.response.HotelBookingResponse;
import com.ticketkatum.dto.hotel.response.RefundResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.concurrent.CompletableFuture;

/**
 * Client for Booking Service
 * Handles ticket booking, cancellation, and refunds
 */
@Slf4j
@Component("bffBookingServiceClient")
@RequiredArgsConstructor
public class BookingServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;
    @Autowired
    private ObjectMapper objectMapper;

    private static final String CIRCUIT_BREAKER_NAME = "bookingService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getBookingServiceUrl())
                .build();
    }

    /**
     * Book ticket
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "bookTicketFallback")
    @Retry(name = "booking-service")
    public CompletableFuture<HotelBookingResponse> bookTicket(
            String category, String service, HotelBookingRequest request) {

        log.debug("Booking ticket: category={}, service={}", category, service);

        return getWebClient()
                .post()
                .uri("/api/booking/{service}/{category}",service,category)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HotelBookingResponse.class))
                .toFuture();
    }

    /**
     * Cancel booking
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "cancelBookingFallback")
    @Retry(name = "booking-service")
    public CompletableFuture<CancellationResponse> cancelBooking(
            String category, String service, HotelBookingRequest request) {

        log.debug("Cancelling booking: category={}, service={}", category, service);

        return getWebClient()
                .post()
                .uri("/api/booking/{category}/{service}/cancel", category, service)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), CancellationResponse.class))
                .toFuture();
    }

    /**
     * Refund booking
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "refundBookingFallback")
    @Retry(name = "booking-service")
    public CompletableFuture<RefundResponse> refundBooking(
            String category, String service, RefundRequest request) {

        log.debug("Refunding booking: category={}, service={}", category, service);

        return getWebClient()
                .post()
                .uri("/api/booking/{category}/{service}/refund", category, service)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RefundResponse.class))
                .toFuture();
    }

    // Fallback methods
    private CompletableFuture<BookingResponse> bookTicketFallback(
            String category, String service, HotelBookingRequest request, Throwable ex) {
        log.warn("Fallback: bookTicket for category={}, service={}", category, service);
        return CompletableFuture.completedFuture(
                BookingResponse.builder()
                        .success(false)
                        .message("Booking service temporarily unavailable")
                        .build()
        );
    }

    private CompletableFuture<CancellationResponse> cancelBookingFallback(
            String category, String service, HotelBookingRequest request, Throwable ex) {
        log.warn("Fallback: cancelBooking");
        return CompletableFuture.completedFuture(
                CancellationResponse.builder()
                        .success(false)
                        .message("Cancellation service temporarily unavailable")
                        .build()
        );
    }

    private CompletableFuture<RefundResponse> refundBookingFallback(
            String category, String service, RefundRequest request, Throwable ex) {
        log.warn("Fallback: refundBooking");
        return CompletableFuture.completedFuture(
                RefundResponse.builder()
                        .success(false)
                        .message("Refund service temporarily unavailable")
                        .build()
        );
    }

    private <T> T objectMapper(Object data, Class<T> clazz) {
        return objectMapper.convertValue(data, clazz);
    }
}