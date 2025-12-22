package com.ticketkatum.client;

import com.ticketkatum.dto.Response;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Event Service Client
 * Communicates with event-service through WebClient with circuit breaker
 */
@Slf4j
@Component
public class EventServiceClient {

    private final WebClient webClient;

    public EventServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${services.event-service.url:http://localhost:8085}") String eventServiceUrl) {
        this.webClient = webClientBuilder
                .baseUrl(eventServiceUrl)
                .build();
    }

    // ============================================================
    // ORGANIZER OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "registerOrganizerFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> registerOrganizer(Map<String, Object> registrationData) {
        log.info("Registering organizer");
        return webClient.post()
                .uri("/api/organizers/register")
                .bodyValue(registrationData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getOrganizerProfileFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getOrganizerProfile(Long organizerId) {
        log.info("Fetching organizer profile: {}", organizerId);
        return webClient.get()
                .uri("/api/organizers/{id}", organizerId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "updateOrganizerProfileFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> updateOrganizerProfile(Long organizerId, Map<String, Object> updateData) {
        log.info("Updating organizer profile: {}", organizerId);
        return webClient.put()
                .uri("/api/organizers/{id}", organizerId)
                .bodyValue(updateData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getOrganizerDashboardFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getOrganizerDashboard(Long organizerId) {
        log.info("Fetching organizer dashboard: {}", organizerId);
        return webClient.get()
                .uri("/api/organizers/{id}/dashboard", organizerId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // EVENT OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "createEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> createEvent(Map<String, Object> eventData) {
        log.info("Creating event");
        return webClient.post()
                .uri("/api/events")
                .bodyValue(eventData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getEvent(Long eventId) {
        log.info("Fetching event: {}", eventId);
        return webClient.get()
                .uri("/api/events/{id}", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "updateEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> updateEvent(Long eventId, Map<String, Object> updateData) {
        log.info("Updating event: {}", eventId);
        return webClient.put()
                .uri("/api/events/{id}", eventId)
                .bodyValue(updateData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "publishEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> publishEvent(Long eventId) {
        log.info("Publishing event: {}", eventId);
        return webClient.post()
                .uri("/api/events/{id}/publish", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "cancelEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> cancelEvent(Long eventId, Map<String, Object> cancelData) {
        log.info("Cancelling event: {}", eventId);
        return webClient.post()
                .uri("/api/events/{id}/cancel", eventId)
                .bodyValue(cancelData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "searchEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> searchEvents(Map<String, Object> searchParams) {
        log.info("Searching events with params: {}", searchParams);
        return webClient.post()
                .uri("/api/events/search")
                .bodyValue(searchParams)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getFeaturedEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<?>>> getFeaturedEvents() {
        log.info("Fetching featured events");
        return webClient.get()
                .uri("/api/events/featured")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<?>>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getOrganizerEventsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<?>>> getOrganizerEvents(Long organizerId, String status) {
        log.info("Fetching organizer events: {} with status: {}", organizerId, status);
        String uri = status != null
                ? String.format("/api/organizers/%d/events?status=%s", organizerId, status)
                : String.format("/api/organizers/%d/events", organizerId);

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<?>>>() {
                });
    }

    // ============================================================
    // TICKETING OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "createTicketTypeFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> createTicketType(Long eventId, Map<String, Object> ticketData) {
        log.info("Creating ticket type for event: {}", eventId);
        return webClient.post()
                .uri("/api/events/{eventId}/tickets", eventId)
                .bodyValue(ticketData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getEventTicketsFallback")
    @Retry(name = "eventService")
    public Mono<Response<List<?>>> getEventTickets(Long eventId) {
        log.info("Fetching ticket types for event: {}", eventId);
        return webClient.get()
                .uri("/api/events/{eventId}/tickets", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<?>>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "bookTicketsFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> bookTickets(Map<String, Object> bookingData) {
        log.info("Booking event tickets");
        return webClient.post()
                .uri("/api/bookings/event")
                .bodyValue(bookingData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getBookingFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getBooking(String bookingReference) {
        log.info("Fetching booking: {}", bookingReference);
        return webClient.get()
                .uri("/api/bookings/event/{reference}", bookingReference)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "cloneEventFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> cloneEvent(Long eventId) {
        log.info("Cloning event: {}", eventId);
        return webClient.post()
                .uri("/api/events/{id}/clone", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // ANALYTICS OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "getEventAnalyticsFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getEventAnalytics(Long eventId) {
        log.info("Fetching event analytics: {}", eventId);
        return webClient.get()
                .uri("/api/events/{id}/analytics", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getCheckInStatsFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getCheckInStats(Long eventId) {
        log.info("Fetching check-in stats for event: {}", eventId);
        return webClient.get()
                .uri("/api/events/{id}/check-in/stats", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // CHECK-IN OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "checkInFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> checkIn(Map<String, Object> checkInData) {
        log.info("Processing check-in");
        return webClient.post()
                .uri("/api/check-in")
                .bodyValue(checkInData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // COMMUNICATION OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "sendAnnouncementFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> sendAnnouncement(Map<String, Object> announcementData) {
        log.info("Sending event announcement");
        return webClient.post()
                .uri("/api/events/announcements")
                .bodyValue(announcementData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // PROMO CODE OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "validatePromoCodeFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> validatePromoCode(Map<String, Object> request) {
        log.info("Validating promo code");
        return webClient.post()
                .uri("/api/promo-codes/validate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getPromoCodesFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getPromoCodes(Long eventId) {
        log.info("Fetching promo codes for event: {}", eventId);
        return webClient.get()
                .uri("/api/promo-codes/event/{eventId}", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // WAITLIST OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "joinWaitlistFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> joinWaitlist(Map<String, Object> request) {
        log.info("Joining waitlist");
        return webClient.post()
                .uri("/api/waitlist")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "getWaitlistFallback")
    @Retry(name = "eventService")
    public Mono<Response<?>> getWaitlist(Long eventId) {
        log.info("Fetching waitlist for event: {}", eventId);
        return webClient.get()
                .uri("/api/waitlist/event/{eventId}", eventId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<?>>() {
                });
    }

    // ============================================================
    // EXPORT OPERATIONS
    // ============================================================

    @CircuitBreaker(name = "eventService", fallbackMethod = "exportAttendeesFallback")
    @Retry(name = "eventService")
    public Mono<byte[]> exportAttendees(Long eventId, String format) {
        log.info("Exporting attendees for event: {} format: {}", eventId, format);
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/events/{id}/attendees/export")
                        .queryParam("format", format)
                        .build(eventId))
                .retrieve()
                .bodyToMono(byte[].class);
    }

    // ============================================================
    // FALLBACK METHODS
    // ============================================================

    private Mono<Response<?>> registerOrganizerFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for organizer registration", ex);
        return Mono.just(Response.error("Event service is currently unavailable. Please try again later."));
    }

    private Mono<Response<?>> getOrganizerProfileFallback(Long id, Exception ex) {
        log.error("Event service unavailable for organizer profile: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch organizer profile"));
    }

    private Mono<Response<?>> updateOrganizerProfileFallback(Long id, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for organizer update: {}", id, ex);
        return Mono.just(Response.error("Unable to update organizer profile"));
    }

    private Mono<Response<?>> getOrganizerDashboardFallback(Long id, Exception ex) {
        log.error("Event service unavailable for dashboard: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch dashboard data"));
    }

    private Mono<Response<?>> cloneEventFallback(Long id, Exception ex) {
        log.error("Event service unavailable for clone: {}", id, ex);
        return Mono.just(Response.error("Unable to clone event"));
    }

    private Mono<Response<?>> createEventFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event creation", ex);
        return Mono.just(Response.error("Unable to create event. Please try again later."));
    }

    private Mono<Response<?>> getEventFallback(Long id, Exception ex) {
        log.error("Event service unavailable for event: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch event details"));
    }

    private Mono<Response<?>> updateEventFallback(Long id, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event update: {}", id, ex);
        return Mono.just(Response.error("Unable to update event"));
    }

    private Mono<Response<?>> publishEventFallback(Long id, Exception ex) {
        log.error("Event service unavailable for event publish: {}", id, ex);
        return Mono.just(Response.error("Unable to publish event"));
    }

    private Mono<Response<?>> cancelEventFallback(Long id, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for event cancellation: {}", id, ex);
        return Mono.just(Response.error("Unable to cancel event"));
    }

    private Mono<Response<?>> searchEventsFallback(Map<String, Object> params, Exception ex) {
        log.warn("Fallback: Search events failed - {}", ex.getMessage());
        return Mono.just(Response.error("Event search temporarily unavailable"));
    }

    private Mono<Response<List<?>>> getFeaturedEventsFallback(Exception ex) {
        log.error("Event service unavailable for featured events", ex);
        return Mono.just(Response.error("Unable to fetch featured events"));
    }

    private Mono<Response<List<?>>> getOrganizerEventsFallback(Long id, String status, Exception ex) {
        log.error("Event service unavailable for organizer events: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch organizer events"));
    }

    private Mono<Response<?>> createTicketTypeFallback(Long eventId, Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for ticket creation: {}", eventId, ex);
        return Mono.just(Response.error("Unable to create ticket type"));
    }

    private Mono<Response<List<?>>> getEventTicketsFallback(Long eventId, Exception ex) {
        log.error("Event service unavailable for ticket fetch: {}", eventId, ex);
        return Mono.just(Response.success(List.of()));
    }

    private Mono<Response<?>> bookTicketsFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for booking", ex);
        return Mono.just(Response.error("Unable to book tickets. Please try again later."));
    }

    private Mono<Response<?>> getBookingFallback(String reference, Exception ex) {
        log.error("Event service unavailable for booking: {}", reference, ex);
        return Mono.just(Response.error("Unable to fetch booking details"));
    }

    private Mono<Response<?>> getEventAnalyticsFallback(Long id, Exception ex) {
        log.error("Event service unavailable for analytics: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch analytics"));
    }

    private Mono<Response<?>> getCheckInStatsFallback(Long id, Exception ex) {
        log.error("Event service unavailable for check-in stats: {}", id, ex);
        return Mono.just(Response.error("Unable to fetch check-in stats"));
    }

    private Mono<Response<?>> checkInFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for check-in", ex);
        return Mono.just(Response.error("Unable to process check-in"));
    }

    private Mono<Response<?>> sendAnnouncementFallback(Map<String, Object> data, Exception ex) {
        log.error("Event service unavailable for announcement", ex);
        return Mono.just(Response.error("Unable to send announcement"));
    }

    private Mono<Response<?>> validatePromoCodeFallback(Map<String, Object> request, Exception ex) {
        log.error("Event service unavailable for promo code validation", ex);
        return Mono.just(Response.error("Unable to validate promo code"));
    }

    private Mono<Response<?>> getPromoCodesFallback(Long eventId, Exception ex) {
        log.error("Event service unavailable for promo codes: {}", eventId, ex);
        return Mono.just(Response.error("Unable to fetch promo codes"));
    }

    private Mono<Response<?>> joinWaitlistFallback(Map<String, Object> request, Exception ex) {
        log.error("Event service unavailable for waitlist", ex);
        return Mono.just(Response.error("Unable to join waitlist"));
    }

    private Mono<Response<?>> getWaitlistFallback(Long eventId, Exception ex) {
        log.error("Event service unavailable for waitlist: {}", eventId, ex);
        return Mono.just(Response.error("Unable to fetch waitlist"));
    }

    private Mono<byte[]> exportAttendeesFallback(Long eventId, String format, Exception ex) {
        log.error("Event service unavailable for export: {}", eventId, ex);
        return Mono.just(new byte[0]);
    }
}
