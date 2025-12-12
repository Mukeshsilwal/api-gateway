package com.ticketkatum.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MarketServiceClient {

    private final WebClient webClient;

    public MarketServiceClient(WebClient.Builder webClientBuilder,
            @Value("${microservices.market-service-url}") String marketUrl) {
        this.webClient = webClientBuilder.baseUrl(marketUrl).build();
    }

    // === RESALE ===
    public Mono<Object> listTicketForResale(Object request) {
        return webClient.post()
                .uri("/api/v1/market/resale")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Object.class);
    }

    public Flux<Object> getResaleTickets() {
        return webClient.get()
                .uri("/api/v1/market/resale/list")
                .retrieve()
                .bodyToFlux(Object.class);
    }

    // === BUNDLES ===
    public Flux<Object> getBundles() {
        return webClient.get()
                .uri("/api/v1/bundles")
                .retrieve()
                .bodyToFlux(Object.class);
    }

    public Mono<Object> bookBundle(String bundleId, Object request) {
        return webClient.post()
                .uri("/api/v1/bundles/" + bundleId + "/book")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Object.class);
    }

    // === PRICING ===
    public Mono<Object> calculatePrice(String eventId, Double basePrice) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/pricing/calculate")
                        .queryParam("eventId", eventId)
                        .queryParam("basePrice", basePrice)
                        .build())
                .retrieve()
                .bodyToMono(Object.class);
    }

    // === LOYALTY ===
    public Mono<Object> getLoyaltyProfile(String userId) {
        return webClient.get()
                .uri("/api/v1/loyalty/profile/" + userId)
                .retrieve()
                .bodyToMono(Object.class);
    }

    public Flux<Object> getLoyaltyHistory(String userId) {
        return webClient.get()
                .uri("/api/v1/loyalty/history/" + userId)
                .retrieve()
                .bodyToFlux(Object.class);
    }

    // === CROWD FLOW ===
    public Flux<Object> getHeatmap(String eventId) {
        return webClient.get()
                .uri("/api/v1/crowd/heatmap/" + eventId)
                .retrieve()
                .bodyToFlux(Object.class);
    }

    // === LIVE ===
    public Flux<Object> getPolls(String eventId) {
        return webClient.get()
                .uri("/api/v1/live/polls/" + eventId)
                .retrieve()
                .bodyToFlux(Object.class);
    }

    public Mono<Object> vote(Object request) {
        return webClient.post()
                .uri("/api/v1/live/vote")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Object.class);
    }

    public Flux<Object> getMenu(String eventId) {
        return webClient.get()
                .uri("/api/v1/live/products/" + eventId)
                .retrieve()
                .bodyToFlux(Object.class);
    }

    public Mono<Object> orderProduct(Object request) {
        return webClient.post()
                .uri("/api/v1/live/order")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Object.class);
    }
}
