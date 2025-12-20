package com.ticketkatum.events.base;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

/**
 * Base class for all domain events in the system.
 * Provides common fields like eventId, eventType, timestamp, and correlation tracking.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent {

    /**
     * Unique identifier for this event instance
     */
    private String eventId;

    /**
     * Type of the event (e.g., "events.organizer.onboarded.v1")
     */
    private String eventType;

    /**
     * Timestamp when the event was created
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant timestamp;

    /**
     * Correlation ID for tracing related events across services
     */
    private String correlationId;

    /**
     * ID of the user/service that triggered this event
     */
    private String causedBy;

    /**
     * Version of the event schema
     */
    private String schemaVersion;

    /**
     * Initialize default values for base fields
     */
    protected void initializeBaseFields(String eventType) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.timestamp = Instant.now();
        this.schemaVersion = extractVersionFromEventType(eventType);
    }

    private String extractVersionFromEventType(String eventType) {
        if (eventType != null && eventType.contains(".v")) {
            return eventType.substring(eventType.lastIndexOf(".v") + 1);
        }
        return "v1";
    }

    /**
     * Get the event payload - to be implemented by subclasses
     */
    public abstract Object getPayload();
}
