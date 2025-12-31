package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.PricingRule;
import com.ticketkatum.market.repository.PricingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingService {

    private final PricingRuleRepository ruleRepository;

    // In a real app, this would call BookingService
    // For now, we simulate "Context" passed in the request or fetched
    public BigDecimal calculatePrice(UUID itemId, BigDecimal basePrice, double availabilityPercentage, double hoursToEvent) {
        log.info("Calculating dynamic price for item: {} (Base: {}, Avail: {}%, Time: {}h)", 
                itemId, basePrice, availabilityPercentage * 100, hoursToEvent);

        List<PricingRule> rules = ruleRepository.findByActiveTrueOrderByPriorityAsc();
        BigDecimal finalPrice = basePrice;

        for (PricingRule rule : rules) {
            // Check if rule is applicable (Global or Specific logic could go here)
            // For simplicity, we just check the Condition matches
            boolean applied = false;

            switch (rule.getRuleType()) {
                case SCARCITY:
                    // If availability is LESS than condition (e.g., < 0.10)
                    if (availabilityPercentage <= rule.getConditionValue()) {
                        applied = true;
                    }
                    break;
                case TIME_BASED:
                    // If hours remaining is LESS than condition (e.g., < 24h)
                    if (hoursToEvent <= rule.getConditionValue()) {
                        applied = true;
                    }
                    break;
                default:
                    break;
            }

            if (applied) {
                BigDecimal oldPrice = finalPrice;
                finalPrice = finalPrice.multiply(BigDecimal.valueOf(rule.getMultiplier()));
                log.info("Rule Applied: {} (Multiplier: {}). Price {} -> {}", rule.getRuleType(), rule.getMultiplier(), oldPrice, finalPrice);
            }
        }

        // Safety Cap (e.g., Max 3x base price)
        BigDecimal maxPrice = basePrice.multiply(BigDecimal.valueOf(3.0));
        if (finalPrice.compareTo(maxPrice) > 0) {
            finalPrice = maxPrice;
        }

        return finalPrice.setScale(2, RoundingMode.HALF_UP);
    }
}
