package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.BookingRequestDto;
import com.ticketkatum.dto.bus.CancelTicketRequest;
import com.ticketkatum.dto.bus.ReservationResponse;
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
public class BookingRequestServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<ReservationResponse> reserveSeat(
            BookingRequestDto request, Integer seatId) {
        return getWebClient().post().uri("/bookSeats/{seatId}", seatId)
                .bodyValue(request).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), ReservationResponse.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<Void> cancelReservation(String email, String ticketNo) {
        CancelTicketRequest request = new CancelTicketRequest();
        request.setEmail(email);
        request.setTicketNo(Long.parseLong(ticketNo));

        return getWebClient().post().uri("/bookSeats/cancel")
                .bodyValue(request).retrieve().bodyToMono(Void.class).toFuture();
    }

    private <T> T map(Object data, Class<T> clazz) {
        return new com.fasterxml.jackson.databind.ObjectMapper().convertValue(data, clazz);
    }
}

