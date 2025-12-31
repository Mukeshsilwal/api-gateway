package com.ticketkatum.alertservice.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.alertservice.service.AlertProcessingEngine;
import com.ticketkatum.events.trip.TripCreatedEvent;
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

    @KafkaListener(topics = "trip-events")
    public void handleTripEvent(TripCreatedEvent event) {
        log.debug("Received trip event: {}", event);
        try {
            // Convert event to map for processing
            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("eventType", event.getEventType());
            payload.put("tripId", event.getTripId());
            payload.put("userId", event.getUserId());
            payload.put("tripName", event.getTripName());
            payload.put("status", event.getStatus());
            payload.put("startDate", event.getStartDate());
            payload.put("endDate", event.getEndDate());
            payload.put("timestamp", event.getTimestamp());

            alertProcessingEngine.processEvent(event.getEventType(), payload);
        } catch (Exception e) {
            log.error("Failed to process trip event: {}", event, e);
        }
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
