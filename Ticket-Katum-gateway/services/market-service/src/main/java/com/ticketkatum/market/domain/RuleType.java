package com.ticketkatum.market.domain;

public enum RuleType {
    SCARCITY,       // e.g., "Less than 10% items left"
    TIME_BASED,     // e.g., "Less than 24h to event"
    DEMAND_VELOCITY // e.g., "Sold 100 items in last hour"
}
