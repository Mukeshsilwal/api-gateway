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
    public Mono<com.ticketkatum.dto.market.ResaleListing> listTicketForResale(com.ticketkatum.dto.market.CreateListingRequest request) {
        return webClient.post()
                .uri("/api/v1/market/listings") // Corrected path
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(com.ticketkatum.dto.market.ResaleListing.class);
    }

    public Flux<com.ticketkatum.dto.market.ResaleListing> getResaleTickets(java.util.UUID eventId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/market/listings")
                        .queryParam("eventId", eventId)
                        .build()) // Corrected path
                .retrieve()
                .bodyToFlux(com.ticketkatum.dto.market.ResaleListing.class);
    }
    
    public Mono<com.ticketkatum.dto.market.ResaleTransaction> buyListing(java.util.UUID listingId, com.ticketkatum.dto.market.PurchaseRequest request) {
         return webClient.post()
                .uri("/api/v1/market/listings/" + listingId + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(com.ticketkatum.dto.market.ResaleTransaction.class);
    }

    // === BUNDLES ===
    public Flux<com.ticketkatum.dto.market.Bundle> getBundles() {
        return webClient.get()
                .uri("/api/v1/bundles")
                .retrieve()
                .bodyToFlux(com.ticketkatum.dto.market.Bundle.class);
    }

    public Mono<String> bookBundle(String bundleId, com.ticketkatum.dto.market.BundleBookingRequest request) {
        return webClient.post()
                .uri("/api/v1/bundles/" + bundleId + "/book")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class);
    }

    // === ORGANIZER ===
    public Mono<com.ticketkatum.dto.market.EventAnalytics> getOrganizerDashboard(java.util.UUID eventId) {
        return webClient.get()
                .uri("/api/v1/organizer/dashboard/" + eventId)
                .retrieve()
                .bodyToMono(com.ticketkatum.dto.market.EventAnalytics.class);
    }

    // === PRICING ===
    public Mono<Object> calculatePrice(String eventId, Double basePrice) { // Response DTO unknown, keeping Object
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
