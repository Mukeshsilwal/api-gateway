package com.ticketkatum.client;

import com.ticketkatum.config.WebClientInvoker;
import com.ticketkatum.dto.BookingRequest;
import com.ticketkatum.dto.BookingResponse;
import com.ticketkatum.dto.GenericRequest;
import com.ticketkatum.dto.GenericResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
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
public class BookingServiceClient extends WebClientInvoker {

    @Qualifier("bookingWebClient")
    @Autowired
    private WebClient webClient;

    private static final String SERVICE = "bookingService";

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackCreate")
    @Retry(name = SERVICE)
    public Mono<GenericResponse<BookingResponse>> createBooking(BookingRequest request) {

        GenericRequest<BookingRequest> wrapper =
                GenericRequest.wrap(request, "web-bff");

        return invoke(
                webClient.post()
                        .uri("/api/bookings")
                        .bodyValue(wrapper)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<BookingResponse>>() {}),
                SERVICE,
                "createBooking"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackGetBooking")
    @Cacheable(value = "bookings", key = "#bookingId")
    public Mono<GenericResponse<BookingResponse>> getBooking(String bookingId) {

        log.debug("Fetching booking | booking_id={}", bookingId);

        return invoke(
                webClient.get()
                        .uri("/api/bookings/{id}", bookingId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<BookingResponse>>() {}),
                SERVICE,
                "getBooking"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackUserBookings")
    public Mono<List<BookingResponse>> getUserBookings(
            String userId, Integer page, Integer limit) {

        log.debug("Fetching user bookings | user_id={} | page={} | limit={}",
                userId, page, limit);

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/bookings/user/{userId}")
                                .queryParam("page", page)
                                .queryParam("limit", limit)
                                .build(userId))
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<List<BookingResponse>>>() {}),
                SERVICE,
                "getUserBookings"
        ).map(response -> response.isSuccess() && response.getData() != null ?
                response.getData() : Collections.emptyList());
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackCancel")
    @CacheEvict(value = "bookings", key = "#bookingId")
    public Mono<GenericResponse<Void>> cancelBooking(String bookingId, String userId) {

        log.info("Cancelling booking | booking_id={} | user_id={}", bookingId, userId);

        return invoke(
                webClient.delete()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/bookings/{id}")
                                .queryParam("userId", userId)
                                .build(bookingId))
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<Void>>() {}),
                SERVICE,
                "cancelBooking"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackUpdate")
    @CacheEvict(value = "bookings", key = "#bookingId")
    public Mono<GenericResponse<BookingResponse>> updateBooking(
            String bookingId, BookingRequest request) {

        log.info("Updating booking | booking_id={}", bookingId);

        GenericRequest<BookingRequest> wrapper =
                GenericRequest.wrap(request, "web-bff");

        return invoke(
                webClient.put()
                        .uri("/api/bookings/{id}", bookingId)
                        .bodyValue(wrapper)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<BookingResponse>>() {}),
                SERVICE,
                "updateBooking"
        );
    }

    // Fallback methods - Type-safe
    private Mono<GenericResponse<BookingResponse>> fallbackCreate(
            BookingRequest req, Throwable ex) {

        log.error("Create booking fallback | error={}", ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Booking service unavailable. Please try again later.",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<GenericResponse<BookingResponse>> fallbackGetBooking(
            String bookingId, Throwable ex) {

        log.error("Get booking fallback | booking_id={} | error={}",
                bookingId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Unable to fetch booking details",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<List<BookingResponse>> fallbackUserBookings(
            String userId, Integer page, Integer limit, Throwable ex) {

        log.error("User bookings fallback | user_id={} | error={}",
                userId, ex.getMessage());

        return Mono.just(Collections.emptyList());
    }

    private Mono<GenericResponse<Void>> fallbackCancel(
            String bookingId, String userId, Throwable ex) {

        log.error("Cancel booking fallback | booking_id={} | error={}",
                bookingId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Unable to cancel booking. Please contact support.",
                UUID.randomUUID().toString()
        ));
    }

    private Mono<GenericResponse<BookingResponse>> fallbackUpdate(
            String bookingId, BookingRequest request, Throwable ex) {

        log.error("Update booking fallback | booking_id={} | error={}",
                bookingId, ex.getMessage());

        return Mono.just(GenericResponse.failure(
                "Unable to update booking",
                UUID.randomUUID().toString()
        ));
    }
}