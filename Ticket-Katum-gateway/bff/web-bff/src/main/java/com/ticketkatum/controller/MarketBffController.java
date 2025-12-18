package com.ticketkatum.controller;

import com.ticketkatum.client.MarketServiceClient;
import com.ticketkatum.service.MarketAggregator;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.List;

@RestController
@RequestMapping("/api/bff/market")
@RequiredArgsConstructor
public class MarketBffController {

    private final MarketServiceClient marketClient;
    private final MarketAggregator marketAggregator;

    @GetMapping("/dashboard/live/{eventId}")
    public Mono<ResponseEntity<MarketAggregator.LiveDashboardDTO>> getLiveDashboard(@PathVariable String eventId) {
        return marketAggregator.getLiveDashboard(eventId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/dashboard/organizer/{eventId}")
    public Mono<ResponseEntity<MarketAggregator.OrganizerDashboardDTO>> getOrganizerDashboard(
            @PathVariable String eventId) {
        return marketAggregator.getOrganizerDashboard(eventId)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/resale")
    @Operation(summary = "List ticket for resale", description = "Create a new resale listing")
    public Mono<ResponseEntity<com.ticketkatum.dto.market.ResaleListing>> listTicketForResale(
            @RequestBody com.ticketkatum.dto.market.CreateListingRequest request) {
        return marketClient.listTicketForResale(request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/resale/list")
    @Operation(summary = "Get resale tickets", description = "Get active resale listings for an event")
    public Mono<ResponseEntity<List<com.ticketkatum.dto.market.ResaleListing>>> getResaleTickets(
            @RequestParam java.util.UUID eventId) {
        return marketClient.getResaleTickets(eventId).collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/resale/{id}/buy")
    @Operation(summary = "Buy resale ticket", description = "Purchase a resale listing")
    public Mono<ResponseEntity<com.ticketkatum.dto.market.ResaleTransaction>> buyListing(
            @PathVariable java.util.UUID id,
            @RequestBody com.ticketkatum.dto.market.PurchaseRequest request) {
        return marketClient.buyListing(id, request)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/resale/complete-buy")
    @Operation(summary = "Complete purchase flow", description = "Buy resale listing and initiate payment")
    public Mono<ResponseEntity<com.ticketkatum.dto.market.CompletePurchaseResponse>> completeBuy(
            @RequestBody com.ticketkatum.dto.market.CompletePurchaseRequest request) {
        return marketAggregator.completePurchaseFlow(request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/bundles")
    @Operation(summary = "Get bundles", description = "Get all active bundles")
    public Mono<ResponseEntity<List<com.ticketkatum.dto.market.Bundle>>> getBundles() {
        return marketClient.getBundles().collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/bundles/{bundleId}/book")
    @Operation(summary = "Book bundle", description = "Book a specific bundle")
    public Mono<ResponseEntity<String>> bookBundle(@PathVariable String bundleId,
            @RequestBody com.ticketkatum.dto.market.BundleBookingRequest request) {
        return marketClient.bookBundle(bundleId, request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/organizer/dashboard/{eventId}")
    @Operation(summary = "Organizer dashboard", description = "Get event analytics for organizer")
    public Mono<ResponseEntity<com.ticketkatum.dto.market.EventAnalytics>> getOrganizerDashboard(
            @PathVariable java.util.UUID eventId) {
        return marketClient.getOrganizerDashboard(eventId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/pricing")
    public Mono<ResponseEntity<Object>> calculatePrice(@RequestParam String eventId, @RequestParam Double basePrice) {
        return marketClient.calculatePrice(eventId, basePrice)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/loyalty/{userId}")
    public Mono<ResponseEntity<Object>> getLoyaltyProfile(@PathVariable String userId) {
        return marketClient.getLoyaltyProfile(userId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/loyalty/{userId}/history")
    public Mono<ResponseEntity<List<Object>>> getLoyaltyHistory(@PathVariable String userId) {
        return marketClient.getLoyaltyHistory(userId).collectList()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/crowd/heatmap/{eventId}")
    public Mono<ResponseEntity<List<Object>>> getHeatmap(@PathVariable String eventId) {
        return marketClient.getHeatmap(eventId).collectList()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/live/polls/{eventId}")
    public Mono<ResponseEntity<List<Object>>> getPolls(@PathVariable String eventId) {
        return marketClient.getPolls(eventId).collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/live/vote")
    public Mono<ResponseEntity<Object>> vote(@RequestBody Object request) {
        return marketClient.vote(request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/live/menu/{eventId}")
    public Mono<ResponseEntity<List<Object>>> getMenu(@PathVariable String eventId) {
        return marketClient.getMenu(eventId).collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/live/order")
    public Mono<ResponseEntity<Object>> orderProduct(@RequestBody Object request) {
        return marketClient.orderProduct(request)
                .map(ResponseEntity::ok);
    }
}
