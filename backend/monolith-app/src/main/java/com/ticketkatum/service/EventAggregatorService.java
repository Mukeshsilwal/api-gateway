package com.ticketkatum.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.client.EventServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.event.AggregatedEventDto;
import com.ticketkatum.dto.event.AggregatedBookingDto;
import com.ticketkatum.dto.event.OrganizerDashboardDto;
import com.ticketkatum.entity.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Event Aggregator Service
 * Aggregates data from event-service and other services
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventAggregatorService {

    private final EventServiceClient eventServiceClient;
    private final ObjectMapper objectMapper;

    /**
     * Get aggregated event details
     * Combines event, organizer, and ticket data
     */
    public Mono<AggregatedEventDto> getAggregatedEvent(Long eventId) {
        log.info("Aggregating event data for ID: {}", eventId);

        return eventServiceClient.getEvent(eventId)
                .map(response -> {
                    try {
                        Event event = response.getData();
                        return buildAggregatedEvent(event);
                    } catch (Exception e) {
                        log.error("Error aggregating event data", e);
                        throw new RuntimeException("Failed to aggregate event data", e);
                    }
                });
    }

    /**
     * Get aggregated booking details
     * Combines booking, event, user, and attendee data
     */
    public Mono<AggregatedBookingDto> getAggregatedBooking(String bookingReference) {
        log.info("Aggregating booking data for reference: {}", bookingReference);

        // NOTE: EventServiceClient.getBooking implies returning Response<?> which might be Map.
        // If refactoring, we should ensure getBooking returns Typed Object or handle Map carefully.
        // Assuming current implementation returns Map for booking until fully refactored.
        return eventServiceClient.getBooking(bookingReference)
                .map(response -> {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> bookingData = (Map<String, Object>) response.getData();

                        return buildAggregatedBooking(bookingData);
                    } catch (Exception e) {
                        log.error("Error aggregating booking data", e);
                        throw new RuntimeException("Failed to aggregate booking data", e);
                    }
                });
    }

    /**
     * Get organizer dashboard with all aggregated data
     */
    public Mono<OrganizerDashboardDto> getOrganizerDashboard(Long organizerId) {
        log.info("Aggregating organizer dashboard for ID: {}", organizerId);

        return eventServiceClient.getOrganizerDashboard(organizerId)
                .map(response -> {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> dashboardData = (Map<String, Object>) response.getData();

                        return buildOrganizerDashboard(dashboardData);
                    } catch (Exception e) {
                        log.error("Error aggregating dashboard data", e);
                        throw new RuntimeException("Failed to aggregate dashboard data", e);
                    }
                });
    }

    /**
     * Search events with aggregated data
     */
    public Mono<List<AggregatedEventDto>> searchAggregatedEvents(Map<String, Object> searchParams) {
        log.info("Searching aggregated events");

        return eventServiceClient.searchEvents(searchParams)
                .map(response -> {
                    try {
                        Page<Event> eventsPage = response.getData();
                        if (eventsPage == null) {
                            return Collections.emptyList();
                        }
                        
                        return eventsPage.getContent().stream()
                                .map(this::buildAggregatedEvent)
                                .collect(Collectors.toList());
                    } catch (Exception e) {
                        log.error("Error aggregating search results", e);
                        return Collections.emptyList();
                    }
                });
    }

    // Helper methods to build aggregated DTOs

    private AggregatedEventDto buildAggregatedEvent(Event event) {
        // Build organizer info
        AggregatedEventDto.OrganizerInfo organizer = null;
        /*
         * Note: Directly accessing entities. Update accessors if needed.
         * Assuming Event has getOrganizerId(), getOrganizerName(), etc. or related relationships.
         * For strict modularity, we rely on what fields Event exposes.
         * If Event entity has simplified fields, use them.
         * Checking standard usage: often Entities have object relationships.
         */
       
        // Fallback: Use ObjectMapper to convert Entity to Map if relationships are complex or lazy?
        // No, we want strong types. Let's assume basic fields for now and null safety.
        
        // TODO: Map organizer from Event entity fields
        /*
        if (event.getOrganizer() != null) {
            organizer = AggregatedEventDto.OrganizerInfo.builder()
                    .id(event.getOrganizer().getId()) 
                    // ... map other fields
                    .build();
        }
        */
        
        // TEMPORARY: Convert Event to Map using ObjectMapper to preserve logic without checking every field of Event.java right now.
        // This is safer to fix the Compilation Error quickly while keeping logic intact.
        // We can optimize later.
        @SuppressWarnings("unchecked")
        Map<String, Object> eventData = objectMapper.convertValue(event, Map.class);
        return buildAggregatedEventFromMap(eventData);
    }
    
    // Legacy method renamed
    private AggregatedEventDto buildAggregatedEventFromMap(Map<String, Object> eventData) {
        @SuppressWarnings("unchecked")
        Map<String, Object> organizerData = (Map<String, Object>) eventData.get("organizer");

        @SuppressWarnings("unchecked")
        Map<String, Object> venueData = (Map<String, Object>) eventData.get("venue");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ticketTypesData = (List<Map<String, Object>>) eventData.getOrDefault("ticketTypes",
                Collections.emptyList());

        // Build organizer info
        AggregatedEventDto.OrganizerInfo organizer = null;
        if (organizerData != null) {
            organizer = AggregatedEventDto.OrganizerInfo.builder()
                    .id(getLong(organizerData, "id"))
                    .name((String) organizerData.get("organizationName"))
                    .logo((String) organizerData.get("logo"))
                    .rating(getBigDecimal(organizerData, "rating"))
                    .totalEvents(getInteger(organizerData, "totalEvents"))
                    .verificationStatus((String) organizerData.get("verificationStatus"))
                    .build();
        }

        // Build venue info
        AggregatedEventDto.VenueInfo venue = null;
        if (venueData != null) {
            venue = AggregatedEventDto.VenueInfo.builder()
                    .id(getLong(venueData, "id"))
                    .name((String) venueData.get("name"))
                    .build();
        }

        // Build ticket types
        List<AggregatedEventDto.TicketTypeInfo> ticketTypes = ticketTypesData.stream()
                .map(ticket -> AggregatedEventDto.TicketTypeInfo.builder()
                        .id(getLong(ticket, "id"))
                        .name((String) ticket.get("name"))
                        .description((String) ticket.get("description"))
                        .price(getBigDecimal(ticket, "price"))
                        .quantity(getInteger(ticket, "quantity"))
                        .quantitySold(getInteger(ticket, "quantitySold"))
                        .available(getInteger(ticket, "quantity") - getInteger(ticket, "quantitySold"))
                        .isActive((Boolean) ticket.get("isActive"))
                        .build())
                .collect(Collectors.toList());

        // Calculate min/max prices
        BigDecimal minPrice = ticketTypes.stream()
                .map(AggregatedEventDto.TicketTypeInfo::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxPrice = ticketTypes.stream()
                .map(AggregatedEventDto.TicketTypeInfo::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return AggregatedEventDto.builder()
                .id(getLong(eventData, "eventId")) // Use eventId as per Entity usually, or id if consistent
                .slug((String) eventData.get("slug"))
                .name((String) eventData.get("name"))
                .category((String) eventData.get("category"))
                .type((String) eventData.get("type"))
                .description((String) eventData.get("description"))
                .shortDescription((String) eventData.get("shortDescription"))
                .coverImage((String) eventData.get("coverImage"))
                .status((String) eventData.get("status"))
                .organizer(organizer)
                .venue(venue)
                .ticketTypes(ticketTypes)
                .totalTickets(getInteger(eventData, "totalTickets"))
                .ticketsSold(getInteger(eventData, "ticketsSold"))
                .ticketsAvailable(getInteger(eventData, "totalTickets") - getInteger(eventData, "ticketsSold"))
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .views(getLong(eventData, "views"))
                .likes(getInteger(eventData, "likes"))
                .shares(getInteger(eventData, "shares"))
                .revenue(getBigDecimal(eventData, "revenue"))
                .build();
    }

    private AggregatedBookingDto buildAggregatedBooking(Map<String, Object> bookingData) {
        // Build event summary
        @SuppressWarnings("unchecked")
        Map<String, Object> eventData = (Map<String, Object>) bookingData.get("event");

        AggregatedBookingDto.EventSummary eventSummary = AggregatedBookingDto.EventSummary.builder()
                .id(getLong(eventData, "id"))
                .name((String) eventData.get("name"))
                .slug((String) eventData.get("slug"))
                .coverImage((String) eventData.get("coverImage"))
                .build();

        // Build user info (would fetch from auth-service in real implementation)
        AggregatedBookingDto.UserInfo userInfo = AggregatedBookingDto.UserInfo.builder()
                .email((String) bookingData.get("contactEmail"))
                .phone((String) bookingData.get("contactPhone"))
                .build();

        return AggregatedBookingDto.builder()
                .id(getLong(bookingData, "id"))
                .bookingReference((String) bookingData.get("bookingReference"))
                .status((String) bookingData.get("status"))
                .paymentStatus((String) bookingData.get("paymentStatus"))
                .event(eventSummary)
                .user(userInfo)
                .totalAmount(getBigDecimal(bookingData, "totalAmount"))
                .platformFee(getBigDecimal(bookingData, "platformFee"))
                .tax(getBigDecimal(bookingData, "tax"))
                .grandTotal(getBigDecimal(bookingData, "grandTotal"))
                .paymentId((String) bookingData.get("paymentId"))
                .build();
    }

    private OrganizerDashboardDto buildOrganizerDashboard(Map<String, Object> dashboardData) {
        // This would aggregate data from multiple sources
        return OrganizerDashboardDto.builder()
                .build();
    }

    // Utility methods
    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return 0L;
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    private BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return BigDecimal.ZERO;
    }
}
