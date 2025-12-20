package com.ticketkatum.events.event;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Event published when a new event is created.
 * Event Type: events.event.created.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EventCreatedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.event.created.v1";

    private EventCreatedPayload payload;

    public EventCreatedEvent(EventCreatedPayload payload) {
        this.payload = payload;
        initializeBaseFields(EVENT_TYPE);
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventCreatedPayload {
        private Long eventId;
        private Long organizerId;
        private String eventName;
        private String description;
        private String category; // CONCERT, SPORTS, CONFERENCE, etc.
        private String venue;
        private String city;
        private String country;
        private LocalDateTime eventDate;
        private LocalDateTime eventEndDate;
        private Integer capacity;
        private String status; // DRAFT, PUBLISHED, CANCELLED
        private Instant createdAt;
        private Boolean isFeatured;
        private String imageUrl;
    }
}
