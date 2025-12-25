package com.ticketkatum.journeyservice.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record JourneySuggestionGeneratedEvent(
        Long journeyId,
        Integer suggestionCount,
        String eventId,
        LocalDateTime eventTimestamp) {
    public JourneySuggestionGeneratedEvent(Long journeyId, Integer suggestionCount) {
        this(journeyId, suggestionCount, UUID.randomUUID().toString(), LocalDateTime.now());
    }
}
