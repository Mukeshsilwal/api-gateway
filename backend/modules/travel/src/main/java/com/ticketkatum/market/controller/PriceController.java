package com.ticketkatum.market.controller;

import com.ticketkatum.market.service.DynamicPricingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PriceController {

    private final DynamicPricingService pricingService;

    @GetMapping("/calculate")
    public ResponseEntity<PriceResponse> calculatePrice(
            @RequestParam UUID itemId,
            @RequestParam BigDecimal basePrice,
            @RequestParam Double availability, // 0.0 to 1.0
            @RequestParam Double hoursRemaining) {

        BigDecimal dynamicPrice = pricingService.calculatePrice(itemId, basePrice, availability, hoursRemaining);
        
        return ResponseEntity.ok(new PriceResponse(itemId, basePrice, dynamicPrice));
    }

    @Data
    public static class PriceResponse {
        private UUID itemId;
        private BigDecimal originalPrice;
        private BigDecimal currentPrice;
        private boolean isSurge;

        public PriceResponse(UUID itemId, BigDecimal originalPrice, BigDecimal currentPrice) {
            this.itemId = itemId;
            this.originalPrice = originalPrice;
            this.currentPrice = currentPrice;
            this.isSurge = currentPrice.compareTo(originalPrice) > 0;
        }
    }
}
