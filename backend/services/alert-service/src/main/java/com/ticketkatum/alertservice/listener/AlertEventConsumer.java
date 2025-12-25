package com.ticketkatum.alertservice.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.alertservice.service.AlertProcessingEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertEventConsumer {

    private final AlertProcessingEngine alertProcessingEngine;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "tracking-events", groupId = "alert-service")
    public void handleTrackingEvent(String message) {
        log.debug("Received tracking event: {}", message);
        processGenericEvent("TRACKING_UPDATE", message);
    }

    @KafkaListener(topics = "timeline-events", groupId = "alert-service")
    public void handleTimelineEvent(String message) {
        log.debug("Received timeline event: {}", message);
        // Timeline events might be "DELAY_DETECTED", "CHECKPOINT_REACHED", etc.
        // We might need to parse to get exact type, or pass generic type to engine.
        processGenericEvent("TIMELINE_UPDATE", message);
    }

    @KafkaListener(topics = "trip-events", groupId = "alert-service")
    public void handleTripEvent(String message) {
        log.debug("Received trip event: {}", message);
        processGenericEvent("TRIP_UPDATE", message);
    }

    private void processGenericEvent(String defaultType, String message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            
            // Extract specific event type from payload if available, else use default
            String eventType = (String) payload.getOrDefault("eventType", defaultType);
            
            alertProcessingEngine.processEvent(eventType, payload);
        } catch (Exception e) {
            log.error("Failed to process incoming event: {}", message, e);
        }
    }
}
