package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.bus.TicketDto;
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
public class TicketServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getTicketByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<TicketDto> getTicketById(Long ticketId) {
        return getWebClient().get().uri("/tickets/{id}", ticketId)
                .retrieve().bodyToMono(TicketDto.class).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<TicketDto> createTicket(
            TicketDto ticketDto, Long seatId, Long bookingId) {
        return getWebClient().post()
                .uri("/tickets/seat/{seatId}/book/{bookingId}", seatId, bookingId)
                .bodyValue(ticketDto).retrieve().bodyToMono(TicketDto.class).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<byte[]> generateTicketPDF(Long ticketId) {
        return getWebClient().get().uri("/tickets/generate?ticketId={id}", ticketId)
                .retrieve().bodyToMono(byte[].class).toFuture();
    }

    public CompletableFuture<TicketDto> getTicketByBookingId(Integer bookingId) {
        // Mock implementation
        return CompletableFuture.completedFuture(new TicketDto());
    }

    private CompletableFuture<TicketDto> getTicketByIdFallback(Long id, Throwable ex) {
        return CompletableFuture.completedFuture(new TicketDto());
    }
}
