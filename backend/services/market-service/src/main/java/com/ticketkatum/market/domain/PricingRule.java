package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pricing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional: context of the rule (specific event ID or null for global)
    private Long eventId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleType ruleType;

    // The threshold to trigger the rule
    // e.g., 0.10 for scarcity (10%), 24.0 for time (24 hours)
    @Column(nullable = false)
    private Double conditionValue;

    // The price multiplier
    // e.g., 1.20 for +20% price, 0.90 for -10% discount
    @Column(nullable = false)
    private Double multiplier;

    // Higher priority rules run first (or last, depending on logic, let's say
    // First)
    private int priority;

    private boolean active;
}
