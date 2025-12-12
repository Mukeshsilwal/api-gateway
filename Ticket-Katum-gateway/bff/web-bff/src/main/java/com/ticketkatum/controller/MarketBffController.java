package com.ticketkatum.controller;

import com.ticketkatum.client.MarketServiceClient;
import com.ticketkatum.service.MarketAggregator;
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
    public Mono<ResponseEntity<Object>> listTicketForResale(@RequestBody Object request) {
        return marketClient.listTicketForResale(request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/resale/list")
    public Mono<ResponseEntity<List<Object>>> getResaleTickets() {
        return marketClient.getResaleTickets().collectList()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/bundles")
    public Mono<ResponseEntity<List<Object>>> getBundles() {
        return marketClient.getBundles().collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/bundles/{bundleId}/book")
    public Mono<ResponseEntity<Object>> bookBundle(@PathVariable String bundleId, @RequestBody Object request) {
        return marketClient.bookBundle(bundleId, request)
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
