package com.ticketkatum.events.publisher;

import com.ticketkatum.events.base.BaseEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Base event publisher that handles Kafka message publishing with error handling and logging.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish an event to Kafka asynchronously.
     *
     * @param event The event to publish
     * @param partitionKey Key for partitioning (e.g., customerId, eventId)
     * @return CompletableFuture with the send result
     */
    public CompletableFuture<SendResult<String, Object>> publishEvent(BaseEvent event, String partitionKey) {
        String topic = event.getEventType();
        
        log.info("Publishing event: {} to topic: {} with key: {}", 
                event.getEventId(), topic, partitionKey);
        
        CompletableFuture<SendResult<String, Object>> future = 
                kafkaTemplate.send(topic, partitionKey, event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Event published successfully: {} to partition: {}, offset: {}",
                        event.getEventId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            } else {
                log.error("Failed to publish event: {} to topic: {}. Error: {}",
                        event.getEventId(), topic, ex.getMessage(), ex);
            }
        });
        
        return future;
    }

    /**
     * Publish an event synchronously (blocking).
     * Use sparingly - prefer async publishing for better performance.
     *
     * @param event The event to publish
     * @param partitionKey Key for partitioning
     */
    public void publishEventSync(BaseEvent event, String partitionKey) {
        try {
            SendResult<String, Object> result = publishEvent(event, partitionKey).get();
            log.info("Event published synchronously: {} to partition: {}", 
                    event.getEventId(), result.getRecordMetadata().partition());
        } catch (Exception e) {
            log.error("Failed to publish event synchronously: {}", event.getEventId(), e);
            throw new RuntimeException("Failed to publish event", e);
        }
    }

    /**
     * Publish an event with correlation ID for distributed tracing.
     *
     * @param event The event to publish
     * @param partitionKey Key for partitioning
     * @param correlationId Correlation ID for tracing
     */
    public CompletableFuture<SendResult<String, Object>> publishEventWithCorrelation(
            BaseEvent event, String partitionKey, String correlationId) {
        event.setCorrelationId(correlationId);
        return publishEvent(event, partitionKey);
    }
}
