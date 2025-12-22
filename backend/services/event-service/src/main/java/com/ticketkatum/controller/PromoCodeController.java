package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.PromoCode;
import com.ticketkatum.service.PromoCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/promo-codes")
@RequiredArgsConstructor
@Tag(name = "Promo Codes", description = "Promo code management APIs")
public class PromoCodeController {

    private final PromoCodeService promoCodeService;

    @PostMapping
    @Operation(summary = "Create promo code")
    public ResponseEntity<Response<PromoCode>> createPromoCode(@RequestBody Map<String, Object> promoData) {
        try {
            PromoCode promoCode = promoCodeService.createPromoCode(promoData);
            return ResponseEntity.ok(Response.success("Promo code created successfully", promoCode));
        } catch (Exception e) {
            log.error("Error creating promo code", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get promo codes by event")
    public ResponseEntity<Response<List<PromoCode>>> getPromoCodesByEvent(@PathVariable Long eventId) {
        try {
            List<PromoCode> promoCodes = promoCodeService.getPromoCodesByEvent(eventId);
            return ResponseEntity.ok(Response.success(promoCodes));
        } catch (Exception e) {
            log.error("Error fetching promo codes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate and apply promo code")
    public ResponseEntity<Response<Map<String, Object>>> validatePromoCode(@RequestBody Map<String, Object> request) {
        try {
            Long eventId = Long.valueOf(request.get("eventId").toString());
            String code = (String) request.get("code");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            Map<String, Object> result = promoCodeService.validateAndApplyPromoCode(eventId, code, amount);

            if ((Boolean) result.get("valid")) {
                return ResponseEntity.ok(Response.success(result));
            } else {
                return ResponseEntity.badRequest()
                        .body(Response.error(400, (String) result.get("message")));
            }
        } catch (Exception e) {
            log.error("Error validating promo code", e);
            return ResponseEntity.badRequest()
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update promo code")
    public ResponseEntity<Response<PromoCode>> updatePromoCode(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        try {
            PromoCode updated = promoCodeService.updatePromoCode(id, updates);
            return ResponseEntity.ok(Response.success("Promo code updated", updated));
        } catch (Exception e) {
            log.error("Error updating promo code", e);
            return ResponseEntity.badRequest()
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete promo code")
    public ResponseEntity<Response<Void>> deletePromoCode(@PathVariable Long id) {
        try {
            promoCodeService.deletePromoCode(id);
            return ResponseEntity.ok(Response.success("Promo code deleted", null));
        } catch (Exception e) {
            log.error("Error deleting promo code", e);
            return ResponseEntity.badRequest()
                    .body(Response.error(400, e.getMessage()));
        }
    }
}
