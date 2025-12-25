package com.ticketkatum.journeyservice.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record JourneySegmentAddedEvent(
        Long journeyId,
        Long segmentId,
        String segmentType,
        String eventId,
        LocalDateTime eventTimestamp) {
    public JourneySegmentAddedEvent(Long journeyId, Long segmentId, String segmentType) {
        this(journeyId, segmentId, segmentType, UUID.randomUUID().toString(), LocalDateTime.now());
    }
}
