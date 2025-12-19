package com.ticketkatum.market.controller;

import com.ticketkatum.market.domain.Bundle;
import com.ticketkatum.market.dto.ContactDetails;
import com.ticketkatum.market.dto.PaymentDetails;
import com.ticketkatum.market.service.BundleService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bundles")
@RequiredArgsConstructor
public class BundleController {

    private final BundleService bundleService;

    @GetMapping
    public ResponseEntity<List<Bundle>> getBundles() {
        return ResponseEntity.ok(bundleService.getActiveBundles());
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<String> bookBundle(
            @PathVariable("id") UUID id,
            @RequestBody BundleBookingRequest request) {
        
        bundleService.bookBundle(id, request.getUserId(), request.getContactDetails(), request.getPaymentDetails());
        return ResponseEntity.ok("Bundle booked successfully");
    }

    @Data
    public static class BundleBookingRequest {
        private UUID userId;
        private ContactDetails contactDetails;
        private PaymentDetails paymentDetails;
    }
}
