package com.ticketkatum.journeyservice.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Publisher for journey-related events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JourneyEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String JOURNEY_CREATED_TOPIC = "journey.created";
    private static final String JOURNEY_UPDATED_TOPIC = "journey.updated";
    private static final String JOURNEY_OPTIMIZED_TOPIC = "journey.optimized";
    private static final String JOURNEY_SEGMENT_ADDED_TOPIC = "journey.segment.added";
    private static final String JOURNEY_SUGGESTION_GENERATED_TOPIC = "journey.suggestion.generated";

    /**
     * Publish journey created event
     */
    public void publishJourneyCreated(JourneyCreatedEvent event) {
        log.info("Publishing journey created event: {}", event.getJourneyId());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(JOURNEY_CREATED_TOPIC,
                event.getJourneyId().toString(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Journey created event published successfully: {}", event.getJourneyId());
            } else {
                log.error("Failed to publish journey created event: {}", ex.getMessage());
            }
        });
    }

    // /**
    // * Publish journey updated event
    // */
    // public void publishJourneyUpdated(Long journeyId, String status) {
    // log.info("Publishing journey updated event: {}", journeyId);
    //
    // var event = new Object() {
    // public final Long journeyId = journeyId;
    // public final String status = status;
    // public final String eventId = java.util.UUID.randomUUID().toString();
    // public final java.time.LocalDateTime eventTimestamp =
    // java.time.LocalDateTime.now();
    // };
    //
    // kafkaTemplate.send(JOURNEY_UPDATED_TOPIC, journeyId.toString(), event);
    // }

    /**
     * Publish journey optimized event
     */
    public void publishJourneyOptimized(Long journeyId, java.math.BigDecimal optimizationScore) {
        log.info("Publishing journey optimized event: {} with score: {}", journeyId, optimizationScore);

        JourneyOptimizedEvent event = new JourneyOptimizedEvent(journeyId, optimizationScore);

        kafkaTemplate.send(JOURNEY_OPTIMIZED_TOPIC, journeyId.toString(), event);
    }

    /**
     * Publish segment added event
     */
    public void publishSegmentAdded(Long journeyId, Long segmentId, String segmentType) {
        log.info("Publishing segment added event: journey={}, segment={}", journeyId, segmentId);

        JourneySegmentAddedEvent event = new JourneySegmentAddedEvent(journeyId, segmentId, segmentType);

        kafkaTemplate.send(JOURNEY_SEGMENT_ADDED_TOPIC, journeyId.toString(), event);
    }

    /**
     * Publish suggestion generated event
     */
    public void publishSuggestionGenerated(Long journeyId, Integer suggestionCount) {
        log.info("Publishing suggestion generated event: journey={}, count={}", journeyId, suggestionCount);

        JourneySuggestionGeneratedEvent event = new JourneySuggestionGeneratedEvent(journeyId, suggestionCount);

        kafkaTemplate.send(JOURNEY_SUGGESTION_GENERATED_TOPIC, journeyId.toString(), event);
    }
}
