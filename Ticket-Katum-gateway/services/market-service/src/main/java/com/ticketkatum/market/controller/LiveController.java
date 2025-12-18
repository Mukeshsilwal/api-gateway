package com.ticketkatum.market.controller;

import com.ticketkatum.market.domain.LivePoll;
import com.ticketkatum.market.domain.Product;
import com.ticketkatum.market.service.LiveInteractionService;
import com.ticketkatum.market.service.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/live")
@RequiredArgsConstructor
public class LiveController {

    private final LiveInteractionService interactionService;
    private final ProductService productService;

    // POLLS
    @GetMapping("/polls/{eventId}")
    public ResponseEntity<List<LivePoll>> getPolls(@PathVariable("eventId") UUID eventId) {
        return ResponseEntity.ok(interactionService.getActivePolls(eventId));
    }

    @PostMapping("/vote")
    public ResponseEntity<String> vote(@RequestBody VoteRequest request) {
        interactionService.castVote(request.getPollId(), request.getSelectedOption());
        return ResponseEntity.ok("Vote Cast!");
    }

    @PostMapping("/admin/create-poll")
    public ResponseEntity<LivePoll> createPoll(@RequestBody LivePoll poll) {
        return ResponseEntity.ok(interactionService.createPoll(poll));
    }

    // F&B
    @GetMapping("/products/{eventId}")
    public ResponseEntity<List<Product>> getMenu(@PathVariable("eventId") UUID eventId) {
        return ResponseEntity.ok(productService.getMenu(eventId));
    }

    @PostMapping("/order")
    public ResponseEntity<String> order(@RequestBody OrderRequest request) {
        productService.orderProduct(request.getUserId(), request.getProductId(), request.getSeatLocation());
        return ResponseEntity.ok("Order Placed. Delivering to " + request.getSeatLocation());
    }

    @PostMapping("/admin/add-product")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }

    @Data
    public static class VoteRequest {
        private UUID pollId;
        private String selectedOption;
    }

    @Data
    public static class OrderRequest {
        private UUID userId;
        private UUID productId;
        private String seatLocation;
    }
}
