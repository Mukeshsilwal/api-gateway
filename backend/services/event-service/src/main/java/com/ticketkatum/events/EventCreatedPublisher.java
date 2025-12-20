package com.ticketkatum.events;

import com.ticketkatum.events.event.EventCreatedEvent;
import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Publisher for event-related events.
 * Handles publishing of event creation and lifecycle events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventCreatedPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish event created event.
     * 
     * @param eventId ID of the created event
     * @param organizerId ID of the organizer
     * @param eventName Name of the event
     * @param description Event description
     * @param category Event category (CONCERT, SPORTS, CONFERENCE, etc.)
     * @param venue Venue name
     * @param city City
     * @param country Country
     * @param eventDate Event start date
     * @param eventEndDate Event end date
     * @param capacity Total capacity
     * @param status Event status (DRAFT, PUBLISHED, CANCELLED)
     * @param isFeatured Whether the event is featured
     * @param imageUrl Event image URL
     */
    public void publishEventCreated(
            Long eventId,
            Long organizerId,
            String eventName,
            String description,
            String category,
            String venue,
            String city,
            String country,
            LocalDateTime eventDate,
            LocalDateTime eventEndDate,
            Integer capacity,
            String status,
            Boolean isFeatured,
            String imageUrl) {
        
        log.info("Publishing event created event for eventId: {}, organizerId: {}", eventId, organizerId);
        
        EventCreatedEvent.EventCreatedPayload payload = 
            EventCreatedEvent.EventCreatedPayload.builder()
                .eventId(eventId)
                .organizerId(organizerId)
                .eventName(eventName)
                .description(description)
                .category(category)
                .venue(venue)
                .city(city)
                .country(country)
                .eventDate(eventDate)
                .eventEndDate(eventEndDate)
                .capacity(capacity)
                .status(status)
                .createdAt(Instant.now())
                .isFeatured(isFeatured != null ? isFeatured : false)
                .imageUrl(imageUrl)
                .build();
        
        EventCreatedEvent event = new EventCreatedEvent(payload);
        event.setCausedBy("event-service");
        
        // Use eventId as partition key for ordering
        eventPublisher.publishEvent(event, eventId.toString());
        
        log.info("Event created event published: eventId={}, eventName={}", 
                event.getEventId(), eventName);
    }
}
