package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.SeatDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeatServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(serviceUrls.getBusServiceUrl()).build();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getAllSeatsFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<SeatDto>> getAllSeats() {
        return getWebClient().get().uri("/seat/get")
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), SeatDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getSeatByIdFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<SeatDto> getSeatById(List<Long> seatId) {
        return getWebClient().get().uri("/seat/get/{id}", seatId)
                .retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), SeatDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService", fallbackMethod = "getSeatsByBusNameFallback")
    @Retry(name = "bus-service")
    public CompletableFuture<List<SeatDto>> getSeatsByBusName(String busName) {
        return getWebClient().get().uri(uriBuilder ->
                        uriBuilder.path("/seat/name").queryParam("busName", busName).build())
                .retrieve().bodyToMono(Response.class)
                .map(r -> mapList(r.getData(), SeatDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<SeatDto> createSeatForBus(SeatDto seatDto) {
        return getWebClient().post().uri("/admin/postSeat")
                .bodyValue(seatDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), SeatDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<SeatDto> updateSeat(SeatDto seatDto, Long seatId) {
        return getWebClient().put().uri("/admin/updateSeat/{id}", seatId)
                .bodyValue(seatDto).retrieve().bodyToMono(Response.class)
                .map(r -> map(r.getData(), SeatDto.class)).toFuture();
    }

    @CircuitBreaker(name = "busService")
    @Retry(name = "bus-service")
    public CompletableFuture<Void> deleteSeat(Long seatId) {
        return getWebClient().delete().uri("/admin/deleteSeat/{id}", seatId)
                .retrieve().bodyToMono(Void.class).toFuture();
    }

    /**
     * Create multiple seats for a bus
     */
    public CompletableFuture<List<SeatDto>> createSeatsForBus(Long busId, Integer numberOfSeats) {
        List<CompletableFuture<SeatDto>> seatFutures = IntStream.range(0, numberOfSeats)
                .mapToObj(i -> {
                    SeatDto seat = new SeatDto();
                    seat.setSeatNumber("S" + (i + 1));
                    seat.setReserved(false);
                    return createSeatForBus(seat);
                })
                .collect(Collectors.toList());

        return CompletableFuture.allOf(seatFutures.toArray(new CompletableFuture[0]))
                .thenApply(v -> seatFutures.stream()
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList()));
    }

    /**
     * Get seats by bus ID (derived from bus name)
     */
    public CompletableFuture<List<SeatDto>> getSeatsByBusId(Long busId) {
        // This would need bus name lookup first
        return getAllSeats()
                .thenApply(seats -> seats.stream()
                        .filter(seat -> seat.getBusId() != null && seat.getBusId().equals(busId))
                        .collect(Collectors.toList()));
    }

    // Fallbacks
    private CompletableFuture<List<SeatDto>> getAllSeatsFallback(Throwable ex) {
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<SeatDto> getSeatByIdFallback(Integer id, Throwable ex) {
        return CompletableFuture.completedFuture(new SeatDto());
    }

    private CompletableFuture<List<SeatDto>> getSeatsByBusNameFallback(String busName, Throwable ex) {
        return CompletableFuture.completedFuture(Collections.emptyList());
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
