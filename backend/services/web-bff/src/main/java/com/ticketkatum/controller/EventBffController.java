package com.ticketkatum.controller;

import com.ticketkatum.client.EventServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.service.EventAggregatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Event BFF Controller
 * Aggregates event service endpoints for frontend
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1")
@RequiredArgsConstructor
@Tag(name = "Event BFF", description = "Event management endpoints")
@SuppressWarnings("rawType")
public class EventBffController {

        private final EventServiceClient eventServiceClient;
        private final EventAggregatorService eventAggregatorService;

        // ============================================================
        // AGGREGATED ENDPOINTS (Optimized for Frontend)
        // ============================================================

        @GetMapping("/events/{id}/aggregated")
        @Operation(summary = "Get aggregated event details (event + organizer + tickets)")
        public Mono<ResponseEntity<Response<Object>>> getAggregatedEvent(@PathVariable("id") Long id) {
                log.info("BFF: Fetching aggregated event: {}", id);
                return eventAggregatorService.getAggregatedEvent(id)
                                .map(event -> ResponseEntity.ok(Response.<Object>success(event)))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @GetMapping("/bookings/event/{reference}/aggregated")
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "Get aggregated booking details (booking + event + attendees)")
        public Mono<ResponseEntity<Response<Object>>> getAggregatedBooking(
                        @PathVariable("reference") String reference) {
                log.info("BFF: Fetching aggregated booking: {}", reference);
                return eventAggregatorService.getAggregatedBooking(reference)
                                .map(booking -> ResponseEntity.ok(Response.<Object>success(booking)))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @GetMapping("/organizers/{id}/dashboard/aggregated")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get aggregated organizer dashboard (profile + events + analytics)")
        public Mono<ResponseEntity<Response<Object>>> getAggregatedDashboard(@PathVariable("id") Long id) {
                log.info("BFF: Fetching aggregated dashboard: {}", id);
                return eventAggregatorService.getOrganizerDashboard(id)
                                .map(dashboard -> ResponseEntity.ok(Response.<Object>success(dashboard)))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @PostMapping("/events/search/aggregated")
        @Operation(summary = "Search events with aggregated data")
        public Mono<ResponseEntity<Response<Object>>> searchAggregatedEvents(
                        @RequestBody Map<String, Object> searchParams) {
                log.info("BFF: Searching aggregated events");
                return eventAggregatorService.searchAggregatedEvents(searchParams)
                                .map(events -> ResponseEntity.ok(Response.<Object>success(events)))
                                .defaultIfEmpty(ResponseEntity.ok().body(Response.success(List.of())));
        }

        // ============================================================
        // ORGANIZER ENDPOINTS
        // ============================================================

        @PostMapping("/organizers/register")
        @Operation(summary = "Register new organizer")
        public Mono<ResponseEntity<Response<?>>> registerOrganizer(@RequestBody Map<String, Object> registrationData) {
                log.info("BFF: Registering organizer");
                return eventServiceClient.registerOrganizer(registrationData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest()
                                                .body(Response.error("Invalid registration data")));
        }

        @GetMapping("/organizers/{id}")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get organizer profile")
        public Mono<ResponseEntity<Response<?>>> getOrganizerProfile(@PathVariable("id") Long id) {
                log.info("BFF: Fetching organizer profile: {}", id);
                return eventServiceClient.getOrganizerProfile(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @PutMapping("/organizers/{id}")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Update organizer profile")
        public Mono<ResponseEntity<Response<?>>> updateOrganizerProfile(
                        @PathVariable("id") Long id,
                        @RequestBody Map<String, Object> updateData) {
                log.info("BFF: Updating organizer profile: {}", id);
                return eventServiceClient.updateOrganizerProfile(id, updateData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @GetMapping("/organizers/{id}/dashboard")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get organizer dashboard")
        public Mono<ResponseEntity<Response<?>>> getOrganizerDashboard(@PathVariable("id") Long id) {
                log.info("BFF: Fetching organizer dashboard: {}", id);
                return eventServiceClient.getOrganizerDashboard(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @GetMapping("/organizers/{id}/events")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get organizer events")
        public Mono<ResponseEntity<Response<List<?>>>> getOrganizerEvents(
                        @PathVariable("id") Long id,
                        @RequestParam(required = false) String status) {
                log.info("BFF: Fetching organizer events: {} with status: {}", id, status);
                return eventServiceClient.getOrganizerEvents(id, status)
                                .map(r -> (ResponseEntity<Response<List<?>>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.ok().body(Response.success(List.of())));
        }

        // ============================================================
        // EVENT ENDPOINTS
        // ============================================================

        @PostMapping("/events")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Create new event")
        public Mono<ResponseEntity<Response<?>>> createEvent(@RequestBody Map<String, Object> eventData) {
                log.info("BFF: Creating event");
                return eventServiceClient.createEvent(eventData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @GetMapping("/events/categories")
        @Operation(summary = "Get event categories")
        public Mono<ResponseEntity<Response<List<String>>>> getEventCategories() {
                log.info("BFF: Fetching event categories");
                List<String> categories = Arrays.asList(
                                "Music", "Sports", "Arts", "Technology", "Food", "Conference", "Workshop", "Other");
                return Mono.just(ResponseEntity.ok(Response.success(categories)));
        }

        @GetMapping("/events/featured")
        @Operation(summary = "Get featured events")
        public Mono<ResponseEntity<Response<List<?>>>> getFeaturedEvents() {
                log.info("BFF: Fetching featured events");
                return eventServiceClient.getFeaturedEvents()
                                .map(r -> (ResponseEntity<Response<List<?>>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.ok().body(Response.success(List.of())));
        }

        @GetMapping("/events/{id}")
        @Operation(summary = "Get event by ID")
        public Mono<ResponseEntity<Response<?>>> getEvent(@PathVariable("id") Long id) {
                log.info("BFF: Fetching event: {}", id);
                return eventServiceClient.getEvent(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @PutMapping("/events/{id}")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Update event")
        public Mono<ResponseEntity<Response<?>>> updateEvent(
                        @PathVariable("id") Long id,
                        @RequestBody Map<String, Object> updateData) {
                log.info("BFF: Updating event: {}", id);
                return eventServiceClient.updateEvent(id, updateData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @PostMapping("/events/{id}/publish")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Publish event")
        public Mono<ResponseEntity<Response<?>>> publishEvent(@PathVariable("id") Long id) {
                log.info("BFF: Publishing event: {}", id);
                return eventServiceClient.publishEvent(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @PostMapping("/events/{id}/cancel")
        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Cancel event")
        public Mono<ResponseEntity<Response<?>>> cancelEvent(
                        @PathVariable("id") Long id,
                        @RequestBody Map<String, Object> cancelData) {
                log.info("BFF: Cancelling event: {}", id);
                return eventServiceClient.cancelEvent(id, cancelData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @PostMapping("/events/search")
        @Operation(summary = "Search events")
        public Mono<ResponseEntity<Response<List<?>>>> searchEvents(@RequestBody Map<String, Object> searchParams) {
                log.info("BFF: Searching events");
                return eventServiceClient.searchEvents(searchParams)
                                .map(r -> (ResponseEntity<Response<List<?>>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.ok().body(Response.success(List.of())));
        }

        // ============================================================
        // TICKETING ENDPOINTS
        // ============================================================

        @PostMapping("/events/{eventId}/tickets")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Create ticket type")
        public Mono<ResponseEntity<Response<?>>> createTicketType(
                        @PathVariable("eventId") Long eventId,
                        @RequestBody Map<String, Object> ticketData) {
                log.info("BFF: Creating ticket type for event: {}", eventId);
                return eventServiceClient.createTicketType(eventId, ticketData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @PostMapping("/bookings/event")
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "Book event tickets")
        public Mono<ResponseEntity<Response<?>>> bookTickets(@RequestBody Map<String, Object> bookingData) {
                log.info("BFF: Booking event tickets");
                return eventServiceClient.bookTickets(bookingData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        @GetMapping("/bookings/event/{reference}")
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "Get booking details")
        public Mono<ResponseEntity<Response<?>>> getBooking(@PathVariable("reference") String reference) {
                log.info("BFF: Fetching booking: {}", reference);
                return eventServiceClient.getBooking(reference)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        // ============================================================
        // ANALYTICS ENDPOINTS
        // ============================================================

        @GetMapping("/events/{id}/analytics")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get event analytics")
        public Mono<ResponseEntity<Response<?>>> getEventAnalytics(@PathVariable("id") Long id) {
                log.info("BFF: Fetching event analytics: {}", id);
                return eventServiceClient.getEventAnalytics(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        @GetMapping("/events/{id}/check-in/stats")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Get check-in statistics")
        public Mono<ResponseEntity<Response<?>>> getCheckInStats(@PathVariable("id") Long id) {
                log.info("BFF: Fetching check-in stats for event: {}", id);
                return eventServiceClient.getCheckInStats(id)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.notFound().build());
        }

        // ============================================================
        // CHECK-IN ENDPOINTS
        // ============================================================

        @PostMapping("/check-in")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Check in attendee")
        public Mono<ResponseEntity<Response<?>>> checkIn(@RequestBody Map<String, Object> checkInData) {
                log.info("BFF: Processing check-in");
                return eventServiceClient.checkIn(checkInData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }

        // ============================================================
        // COMMUNICATION ENDPOINTS
        // ============================================================

        @PostMapping("/events/announcements")
//        @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Send event announcement")
        public Mono<ResponseEntity<Response<?>>> sendAnnouncement(@RequestBody Map<String, Object> announcementData) {
                log.info("BFF: Sending event announcement");
                return eventServiceClient.sendAnnouncement(announcementData)
                                .map(r -> (ResponseEntity<Response<?>>) (ResponseEntity<?>) ResponseEntity.ok(r))
                                .defaultIfEmpty(ResponseEntity.badRequest().build());
        }
}
