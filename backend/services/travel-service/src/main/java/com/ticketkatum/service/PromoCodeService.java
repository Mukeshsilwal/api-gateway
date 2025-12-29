package com.ticketkatum.service;

import com.ticketkatum.entity.PromoCode;
import com.ticketkatum.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;

    @Transactional
    public PromoCode createPromoCode(Map<String, Object> promoData) {
        String code = ((String) promoData.get("code")).toUpperCase();

        if (promoCodeRepository.existsByCode(code)) {
            throw new RuntimeException("Promo code already exists");
        }

        PromoCode promoCode = PromoCode.builder()
                .eventId(Long.valueOf(promoData.get("eventId").toString()))
                .code(code)
                .description((String) promoData.get("description"))
                .discountType(PromoCode.DiscountType.valueOf((String) promoData.get("discountType")))
                .discountValue(new BigDecimal(promoData.get("discountValue").toString()))
                .maxUses(promoData.get("maxUses") != null ? (Integer) promoData.get("maxUses") : null)
                .currentUses(0)
                .validFrom(promoData.get("validFrom") != null ? LocalDateTime.parse((String) promoData.get("validFrom"))
                        : null)
                .validUntil(
                        promoData.get("validUntil") != null ? LocalDateTime.parse((String) promoData.get("validUntil"))
                                : null)
                .minPurchaseAmount(promoData.get("minPurchaseAmount") != null
                        ? new BigDecimal(promoData.get("minPurchaseAmount").toString())
                        : null)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        return promoCodeRepository.save(promoCode);
    }

    public List<PromoCode> getPromoCodesByEvent(Long eventId) {
        return promoCodeRepository.findByEventId(eventId);
    }

    public PromoCode getPromoCodeById(Long id) {
        return promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
    }

    @Transactional
    public PromoCode updatePromoCode(Long id, Map<String, Object> updates) {
        PromoCode promoCode = getPromoCodeById(id);

        if (updates.containsKey("description")) {
            promoCode.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("active")) {
            promoCode.setActive((Boolean) updates.get("active"));
        }
        if (updates.containsKey("maxUses")) {
            promoCode.setMaxUses((Integer) updates.get("maxUses"));
        }
        if (updates.containsKey("validUntil")) {
            promoCode.setValidUntil(LocalDateTime.parse((String) updates.get("validUntil")));
        }

        return promoCodeRepository.save(promoCode);
    }

    @Transactional
    public void deletePromoCode(Long id) {
        promoCodeRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> validateAndApplyPromoCode(Long eventId, String code, BigDecimal amount) {
        log.info("Validating promo code: {} for event: {}", code, eventId);

        PromoCode promoCode = promoCodeRepository.findByCodeAndEventId(code.toUpperCase(), eventId)
                .orElseThrow(() -> new RuntimeException("Invalid promo code"));

        Map<String, Object> result = new HashMap<>();

        if (!promoCode.isValid()) {
            result.put("valid", false);
            result.put("message", "Promo code is not valid or has expired");
            return result;
        }

        BigDecimal discount = promoCode.calculateDiscount(amount);

        if (discount.compareTo(BigDecimal.ZERO) == 0 && promoCode.getMinPurchaseAmount() != null) {
            result.put("valid", false);
            result.put("message", "Minimum purchase amount not met");
            return result;
        }

        // Increment usage count
        promoCode.setCurrentUses(promoCode.getCurrentUses() + 1);
        promoCodeRepository.save(promoCode);

        result.put("valid", true);
        result.put("discountAmount", discount);
        result.put("discountType", promoCode.getDiscountType());
        result.put("finalAmount", amount.subtract(discount));
        result.put("code", code);

        log.info("Promo code applied successfully. Discount: {}", discount);
        return result;
    }
}
