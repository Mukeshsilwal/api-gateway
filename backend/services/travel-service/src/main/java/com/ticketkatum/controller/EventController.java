package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.Event;
import com.ticketkatum.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Event Controller
 * REST API for event management
 */
@Slf4j
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management APIs")
public class EventController {

    private final EventService eventService;
    private final com.ticketkatum.service.AnalyticsService analyticsService;
    private final com.ticketkatum.service.ExportService exportService;
    private final com.ticketkatum.service.EventCloneService eventCloneService;

    @PostMapping
    @Operation(summary = "Create new event")
    public ResponseEntity<Response<Event>> createEvent(@RequestBody Map<String, Object> eventData) {
        try {
            Event event = eventService.createEvent(eventData);
            return ResponseEntity.ok(Response.success("Event created successfully", event));
        } catch (Exception e) {
            log.error("Error creating event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID")
    public ResponseEntity<Response<Event>> getEvent(@PathVariable("id") Long id) {
        try {
            Event event = eventService.getEventById(id);
            return ResponseEntity.ok(Response.success(event));
        } catch (Exception e) {
            log.error("Error fetching event", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Response.error(404, e.getMessage()));
        }
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get event by slug")
    public ResponseEntity<Response<Event>> getEventBySlug(@PathVariable("slug") String slug) {
        try {
            Event event = eventService.getEventBySlug(slug);
            return ResponseEntity.ok(Response.success(event));
        } catch (Exception e) {
            log.error("Error fetching event by slug", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Response.error(404, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update event")
    public ResponseEntity<Response<Event>> updateEvent(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> updateData) {
        try {
            Event event = eventService.updateEvent(id, updateData);
            return ResponseEntity.ok(Response.success("Event updated successfully", event));
        } catch (Exception e) {
            log.error("Error updating event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @PostMapping("/{id}/clone")
    @Operation(summary = "Clone event")
    public ResponseEntity<Response<Event>> cloneEvent(@PathVariable("id") Long id) {
        try {
            Event clonedEvent = eventCloneService.cloneEvent(id);
            return ResponseEntity.ok(Response.success("Event cloned successfully", clonedEvent));
        } catch (Exception e) {
            log.error("Error cloning event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/{eventId}/tickets")
    @Operation(summary = "Get ticket types for event")
    public ResponseEntity<Response<List<com.ticketkatum.entity.TicketType>>> getEventTickets(
            @PathVariable("eventId") Long eventId) {
        try {
            List<com.ticketkatum.entity.TicketType> tickets = eventService.getTicketTypes(eventId);
            return ResponseEntity.ok(Response.success(tickets));
        } catch (Exception e) {
            log.error("Error fetching tickets for event: {}", eventId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish event")
    public ResponseEntity<Response<Event>> publishEvent(@PathVariable("id") Long id) {
        try {
            Event event = eventService.publishEvent(id);
            return ResponseEntity.ok(Response.success("Event published successfully", event));
        } catch (Exception e) {
            log.error("Error publishing event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel event")
    public ResponseEntity<Response<Event>> cancelEvent(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> cancelData) {
        try {
            String reason = cancelData.get("reason");
            Event event = eventService.cancelEvent(id, reason);
            return ResponseEntity.ok(Response.success("Event cancelled successfully", event));
        } catch (Exception e) {
            log.error("Error cancelling event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @PostMapping("/search")
    @Operation(summary = "Search events")
    public ResponseEntity<Response<Page<Event>>> searchEvents(
            @RequestBody Map<String, Object> searchParams,
            @RequestParam(defaultValue = "0",name = "page") int page,
            @RequestParam(defaultValue = "20",name="size") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Event> events = eventService.searchEvents(searchParams, pageable);
            return ResponseEntity.ok(Response.success(events));
        } catch (Exception e) {
            log.error("Error searching events", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured events")
    public ResponseEntity<Response<List<Event>>> getFeaturedEvents(
            @RequestParam(defaultValue = "10", name = "limit") int limit) {
        try {
            List<Event> events = eventService.getFeaturedEvents(limit);
            return ResponseEntity.ok(Response.success(events));
        } catch (Exception e) {
            log.error("Error fetching featured events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @GetMapping("/{id}/attendees/export")
    @Operation(summary = "Export attendees")
    public ResponseEntity<byte[]> exportAttendees(
            @PathVariable("id") Long id,
            @RequestParam(defaultValue = "csv") String format) {
        try {
            if ("csv".equalsIgnoreCase(format)) {
                byte[] csvData = exportService.exportAttendeesCSV(id);
                return ResponseEntity.ok()
                        .header("Content-Type", "text/csv")
                        .header("Content-Disposition", "attachment; filename=\"attendees_" + id + ".csv\"")
                        .body(csvData);
            } else {
                return ResponseEntity.badRequest().body(null);
            }
        } catch (Exception e) {
            log.error("Error exporting attendees", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/analytics")
    @Operation(summary = "Get event analytics")
    public ResponseEntity<Response<com.ticketkatum.dto.EventAnalyticsDto>> getEventAnalytics(
            @PathVariable("id") Long id) {
        try {
            com.ticketkatum.dto.EventAnalyticsDto analytics = analyticsService.getEventAnalytics(id);
            return ResponseEntity.ok(Response.success(analytics));
        } catch (Exception e) {
            log.error("Error fetching event analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event")
    public ResponseEntity<Response<Void>> deleteEvent(@PathVariable("id") Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok(Response.success("Event deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }
}
