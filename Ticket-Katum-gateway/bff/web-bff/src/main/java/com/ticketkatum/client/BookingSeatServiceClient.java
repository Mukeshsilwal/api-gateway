package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.BookingTicketDto;
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
public class BookingSeatServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getAllBookingsFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<BookingTicketDto>> getAllBookings() {
        return getWebClient().get().uri("/booking/get")
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), BookingTicketDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getBookingByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<BookingTicketDto> getBookingById(long bookingId) {
        return getWebClient().get().uri("/booking/{id}", bookingId)
                .retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BookingTicketDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<BookingTicketDto> createBooking(BookingTicketDto bookingDto) {
        return getWebClient().post().uri("/booking/post")
                .bodyValue(bookingDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), BookingTicketDto.class)).toFuture();
    }

    // Fallbacks
    private CompletableFuture<List<BookingTicketDto>> getAllBookingsFallback(Throwable ex) {
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<BookingTicketDto> getBookingByIdFallback(Integer id, Throwable ex) {
        return CompletableFuture.completedFuture(new BookingTicketDto());
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

