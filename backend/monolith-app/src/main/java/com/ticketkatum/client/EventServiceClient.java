package com.ticketkatum.client;

import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.Event;
import com.ticketkatum.modules.travel.api.EventServiceApi;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Map;

/**
 * Event Service Client (Refactored for Modular Monolith)
 * Uses direct internal method calls to EventServiceApi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventServiceClient {

    private final EventServiceApi eventService;

    // ============================================================
    // EVENT OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "createEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<Event>> createEvent(Map<String, Object> eventData) {
        log.info("Creating event (Internal Call)");
        return Mono.fromCallable(() -> {
            Event event = eventService.createEvent(eventData);
            return Response.<Event>builder()
                    .statusCode(200)
                    .message("Event created successfully")
                    .data(event)
                    .build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<Event>> getEvent(Long eventId) {
        log.info("Fetching event: {}", eventId);
        return Mono.fromCallable(() -> {
            Event event = eventService.getEventById(eventId);
            return Response.success(event);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "updateEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<Event>> updateEvent(Long eventId, Map<String, Object> updateData) {
        log.info("Updating event: {}", eventId);
        return Mono.fromCallable(() -> {
            Event event = eventService.updateEvent(eventId, updateData);
            return Response.<Event>builder()
                    .statusCode(200)
                    .message("Event updated successfully")
                    .data(event)
                    .build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "publishEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<Event>> publishEvent(Long eventId) {
        log.info("Publishing event: {}", eventId);
        return Mono.fromCallable(() -> {
            Event event = eventService.publishEvent(eventId);
            return Response.<Event>builder()
                    .statusCode(200)
                    .message("Event published successfully")
                    .data(event)
                    .build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "cancelEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<Event>> cancelEvent(Long eventId, Map<String, Object> cancelData) {
        log.info("Cancelling event: {}", eventId);
        String reason = (String) cancelData.get("reason");
        return Mono.fromCallable(() -> {
            Event event = eventService.cancelEvent(eventId, reason);
            return Response.<Event>builder()
                    .statusCode(200)
                    .message("Event cancelled successfully")
                    .data(event)
                    .build();
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "searchEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<Page<Event>>> searchEvents(Map<String, Object> searchParams) {
        log.info("Searching events with params: {}", searchParams);
        return Mono.fromCallable(() -> {
            Page<Event> events = eventService.searchEvents(searchParams, PageRequest.of(0, 20));
            return Response.success(events);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getFeaturedEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<Event>>> getFeaturedEvents() {
        log.info("Fetching featured events");
        return Mono.fromCallable(() -> {
            List<Event> events = eventService.getFeaturedEvents(10);
            return Response.<List<Event>>success(events);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getOrganizerEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<Event>>> getOrganizerEvents(Long organizerId, String status) {
        log.info("Fetching organizer events: {}", organizerId);
        return Mono.fromCallable(() -> {
            Page<Event> events = eventService.getOrganizerEvents(organizerId, status, PageRequest.of(0, 100));
            return Response.<List<Event>>success(events.getContent());
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    // ============================================================
    // TICKETING OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "getEventTicketsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<?>>> getEventTickets(Long eventId) {
         return Mono.fromCallable(() -> {
            var tickets = eventService.getTicketTypes(eventId);
            // Explicitly cast and witness to match Mono<Response<List<?>>>
            return Response.<List<?>>success((List<?>)tickets);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "createTicketTypeFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> createTicketType(Long eventId, Map<String, Object> ticketData) {
         return Mono.empty(); 
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "bookTicketsFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> bookTickets(Map<String, Object> bookingData) {
        return Mono.empty(); 
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getBookingFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getBooking(String bookingReference) {
        return Mono.empty();
    }

    // ============================================================
    // ORGANIZER & OTHER OPERATIONS (Placeholders)
    // ============================================================

    public Mono<Response<?>> registerOrganizer(Map<String, Object> registrationData) {
        return Mono.empty(); 
    }

    public Mono<Response<?>> getOrganizerProfile(Long organizerId) {
        return Mono.empty(); 
    }

    public Mono<Response<?>> updateOrganizerProfile(Long organizerId, Map<String, Object> updateData) {
        return Mono.empty();
    }

    public Mono<Response<?>> getOrganizerDashboard(Long organizerId) {
        return Mono.empty();
    }

    public Mono<Response<?>> cloneEvent(Long eventId) {
        return Mono.empty();
    }

    public Mono<Response<?>> getEventAnalytics(Long eventId) {
        return Mono.empty();
    }

    public Mono<Response<?>> getCheckInStats(Long eventId) {
        return Mono.empty();
    }

    public Mono<Response<?>> checkIn(Map<String, Object> checkInData) {
        return Mono.empty();
    }

    public Mono<Response<?>> sendAnnouncement(Map<String, Object> announcementData) {
        return Mono.empty();
    }

    public Mono<Response<?>> validatePromoCode(Map<String, Object> request) {
        return Mono.empty();
    }

    public Mono<Response<?>> getPromoCodes(Long eventId) {
        return Mono.empty();
    }

    public Mono<Response<?>> joinWaitlist(Map<String, Object> request) {
        return Mono.empty();
    }

    public Mono<Response<?>> getWaitlist(Long eventId) {
        return Mono.empty();
    }

    public Mono<byte[]> exportAttendees(Long eventId, String format) {
        return Mono.empty();
    }

    // ============================================================
    // FALLBACK METHODS
    // ============================================================

    private Mono<Response<Event>> createEventFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event creation", ex);
        return Mono.just(Response.<Event>error("Unable to create event. Please try again later."));
    }

    private Mono<Response<Event>> getEventFallback(Long id, Exception ex) {
        log.error("Event service unavailable for event: {}", id, ex);
        return Mono.just(Response.<Event>error("Unable to fetch event details"));
    }

    private Mono<Response<Event>> updateEventFallback(Long id, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event update: {}", id, ex);
        return Mono.just(Response.<Event>error("Unable to update event"));
    }

    private Mono<Response<Event>> publishEventFallback(Long id, Exception ex) {
        log.error("Event service unavailable for event publish: {}", id, ex);
        return Mono.just(Response.<Event>error("Unable to publish event"));
    }

    private Mono<Response<Event>> cancelEventFallback(Long id, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event cancellation: {}", id, ex);
        return Mono.just(Response.<Event>error("Unable to cancel event"));
    }

    private Mono<Response<Page<Event>>> searchEventsFallback(Map<String, Object> params, Exception ex) {
        log.warn("Fallback: Search events failed - {}", ex.getMessage());
        return Mono.just(Response.<Page<Event>>error("Event search temporarily unavailable"));
    }

    private Mono<Response<List<Event>>> getFeaturedEventsFallback(Exception ex) {
        log.error("Event service unavailable for featured events", ex);
        return Mono.just(Response.<List<Event>>error("Unable to fetch featured events"));
    }

    private Mono<Response<List<Event>>> getOrganizerEventsFallback(Long id, String status, Exception ex) {
        log.error("Event service unavailable for organizer events: {}", id, ex);
        return Mono.just(Response.<List<Event>>error("Unable to fetch organizer events"));
    }

    private Mono<Response<?>> createTicketTypeFallback(Long eventId, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for ticket creation: {}", eventId, ex);
        return Mono.just(Response.error("Unable to create ticket type"));
    }

    private Mono<Response<List<?>>> getEventTicketsFallback(Long eventId, Exception ex) {
        log.error("Event service unavailable for ticket fetch: {}", eventId, ex);
        // Explicitly return Response<List<?>> with an empty list of Objects, cast to satisfy generics
        return Mono.just(Response.<List<?>>success(List.of()));
    }

    private Mono<Response<?>> bookTicketsFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for booking", ex);
        return Mono.just(Response.error("Unable to book tickets. Please try again later."));
    }

    private Mono<Response<?>> getBookingFallback(String reference, Exception ex) {
        log.error("Event service unavailable for booking: {}", reference, ex);
        return Mono.just(Response.error("Unable to fetch booking details"));
    }
}

