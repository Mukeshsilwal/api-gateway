package com.ticketkatum.market.controller;

import com.ticketkatum.market.domain.ResaleListing;
import com.ticketkatum.market.domain.ResaleTransaction;
import com.ticketkatum.market.dto.CreateListingRequest;
import com.ticketkatum.market.dto.PurchaseRequest;
import com.ticketkatum.market.service.ResaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final ResaleService resaleService;

    @PostMapping("/listings")
    public ResponseEntity<ResaleListing> createListing(@Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.ok(resaleService.createListing(request));
    }

    @PostMapping("/listings/{id}/buy")
    public ResponseEntity<ResaleTransaction> buyListing(@PathVariable("id") long id,
            @Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(resaleService.purchaseListing(id, request));
    }

    @GetMapping("/listings")
    public ResponseEntity<List<ResaleListing>> getListings(@RequestParam Long eventId) {
        return ResponseEntity.ok(resaleService.getActiveListingsForEvent(eventId));
    }
}
