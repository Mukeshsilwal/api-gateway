package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PricingRuleRepository extends JpaRepository<PricingRule, UUID> {
    List<PricingRule> findByActiveTrueOrderByPriorityAsc();
    List<PricingRule> findByEventIdAndActiveTrue(UUID eventId);
}
