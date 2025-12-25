package com.ticketkatum.journeyservice.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record JourneyOptimizedEvent(
        Long journeyId,
        BigDecimal optimizationScore,
        String eventId,
        LocalDateTime eventTimestamp) {
    public JourneyOptimizedEvent(Long journeyId, BigDecimal optimizationScore) {
        this(journeyId, optimizationScore, UUID.randomUUID().toString(), LocalDateTime.now());
    }
}
