package com.ticketkatum.market.controller;

import com.ticketkatum.market.domain.LoyaltyProfile;
import com.ticketkatum.market.domain.PointTransaction;
import com.ticketkatum.market.repository.PointTransactionRepository;
import com.ticketkatum.market.service.LoyaltyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final PointTransactionRepository transactionRepository;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<LoyaltyProfile> getProfile(@PathVariable("userId") long userId) {
        return ResponseEntity.ok(loyaltyService.getProfile(userId));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<PointTransaction>> getHistory(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/admin/grant-points")
    public ResponseEntity<String> manualGrant(@RequestBody GrantRequest request) {
        loyaltyService.earnPoints(request.getUserId(), request.getSpendAmount(), "ADMIN_GRANT");
        return ResponseEntity.ok("Points granted");
    }

    @Data
    public static class GrantRequest {
        private long userId;
        private int spendAmount;
    }
}
