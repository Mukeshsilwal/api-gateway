package com.ticketkatum.service;

import com.ticketkatum.entity.Event;
import com.ticketkatum.entity.Organizer;
import com.ticketkatum.entity.TicketType;
import com.ticketkatum.repository.EventRepository;
import com.ticketkatum.repository.OrganizerRepository;
import com.ticketkatum.repository.TicketTypeRepository;
import com.ticketkatum.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Event Service
 * Business logic for event management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final OrganizerRepository organizerRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final SlugGenerator slugGenerator;

    /**
     * Create new event
     */
    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public Event createEvent(Map<String, Object> eventData) {
        log.info("Creating new event");

        // Handle both flat and nested structures
        Map<String, Object> data = eventData;
        if (eventData.containsKey("basicInfo")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> basicInfo = (Map<String, Object>) eventData.get("basicInfo");
            data = basicInfo;
        }

        // Get or create default organizer
        Organizer organizer;
        if (eventData.containsKey("organizerId")) {
            Long organizerId = ((Number) eventData.get("organizerId")).longValue();
            organizer = organizerRepository.findById(organizerId)
                    .orElseThrow(() -> new RuntimeException("Organizer not found"));
        } else {
            // Use first organizer or create a default one
            organizer = organizerRepository.findAll().stream()
                    .findFirst()
                    .orElseGet(() -> {
                        Organizer defaultOrganizer = Organizer.builder()
                                .userId(1L) // Default system user
                                .organizationName("Default Organizer")
                                .organizationType(Organizer.OrganizationType.INDIVIDUAL)
                                .verificationStatus(Organizer.VerificationStatus.VERIFIED)
                                .description("Default system organizer")
                                .build();
                        return organizerRepository.save(defaultOrganizer);
                    });
            log.info("Using organizer: {} (ID: {})", organizer.getOrganizationName(), organizer.getId());
        }

        // Generate unique slug
        String name = (String) data.get("name");
        String slug = slugGenerator.generateUniqueSlug(name);

        // Build event
        Event event = Event.builder()
                .organizer(organizer)
                .slug(slug)
                .name(name)
                .category(Event.EventCategory.valueOf((String) data.get("category")))
                .type(Event.EventType.valueOf((String) data.get("type")))
                .startDateTime(LocalDateTime.parse((String) data.get("startDateTime")))
                .endDateTime(LocalDateTime.parse((String) data.get("endDateTime")))
                .description((String) data.get("description"))
                .shortDescription((String) data.get("shortDescription"))
                .coverImage((String) data.get("coverImage"))
                .status(Event.EventStatus.DRAFT)
                .build();

        Event savedEvent = eventRepository.save(event);
        log.info("Event created with ID: {}", savedEvent.getId());

        // Process ticketing data if present
        if (eventData.containsKey("ticketing")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> ticketing = (Map<String, Object>) eventData.get("ticketing");

            if (ticketing.containsKey("ticketTypes")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> ticketTypes = (List<Map<String, Object>>) ticketing.get("ticketTypes");

                int totalTickets = 0;
                log.info("Creating {} ticket types for event {}", ticketTypes.size(), savedEvent.getId());

                for (Map<String, Object> ticketData : ticketTypes) {
                    TicketType ticket = TicketType.builder()
                            .event(savedEvent)
                            .name((String) ticketData.get("name"))
                            .description(ticketData.get("description") != null ? (String) ticketData.get("description")
                                    : null)
                            .price(new BigDecimal(ticketData.get("price").toString()))
                            .quantity(((Number) ticketData.get("quantity")).intValue())
                            .quantitySold(0)
                            .availableFrom(ticketing.get("salesStartDate") != null
                                    ? LocalDateTime.parse((String) ticketing.get("salesStartDate"))
                                    : null)
                            .availableTo(ticketing.get("salesEndDate") != null
                                    ? LocalDateTime.parse((String) ticketing.get("salesEndDate"))
                                    : null)
                            .isActive(true)
                            .sortOrder(0)
                            .build();

                    ticketTypeRepository.save(ticket);
                    totalTickets += ticket.getQuantity();
                    log.info("Created ticket type '{}' with {} tickets", ticket.getName(), ticket.getQuantity());
                }

                // Update event with total tickets
                savedEvent.setTotalTickets(totalTickets);
                savedEvent = eventRepository.save(savedEvent);
                log.info("Updated event total tickets: {}", totalTickets);
            }
        }

        return savedEvent;
    }

    /**
     * Get event by ID
     */
    @Cacheable(value = "events", key = "#id")
    public Event getEventById(Long id) {
        log.info("Fetching event: {}", id);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Increment views
        event.setViews(event.getViews() + 1);
        eventRepository.save(event);

        return event;
    }

    /**
     * Get event by slug
     */
    @Cacheable(value = "events", key = "#slug")
    public Event getEventBySlug(String slug) {
        log.info("Fetching event by slug: {}", slug);
        return eventRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    /**
     * Get ticket types for an event
     */
    public List<TicketType> getTicketTypes(Long eventId) {
        log.info("Fetching ticket types for event: {}", eventId);
        return ticketTypeRepository.findByEventIdOrderBySortOrderAsc(eventId);
    }

    /**
     * Update event
     */
    @Transactional
    @CacheEvict(value = "events", key = "#id")
    public Event updateEvent(Long id, Map<String, Object> updateData) {
        log.info("Updating event: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Update fields if present
        if (updateData.containsKey("name")) {
            event.setName((String) updateData.get("name"));
        }
        if (updateData.containsKey("description")) {
            event.setDescription((String) updateData.get("description"));
        }
        if (updateData.containsKey("coverImage")) {
            event.setCoverImage((String) updateData.get("coverImage"));
        }

        return eventRepository.save(event);
    }

    /**
     * Publish event
     */
    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public Event publishEvent(Long id) {
        log.info("Publishing event: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() != Event.EventStatus.DRAFT) {
            throw new RuntimeException("Only draft events can be published");
        }

        event.setStatus(Event.EventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    /**
     * Cancel event
     */
    @Transactional
    @CacheEvict(value = "events", key = "#id")
    public Event cancelEvent(Long id, String reason) {
        log.info("Cancelling event: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setStatus(Event.EventStatus.CANCELLED);

        return eventRepository.save(event);
    }

    /**
     * Get organizer events
     */
    public Page<Event> getOrganizerEvents(Long organizerId, String status, Pageable pageable) {
        log.info("Fetching events for organizer: {}", organizerId);

        if (status != null) {
            Event.EventStatus eventStatus = Event.EventStatus.valueOf(status);
            return eventRepository.findByOrganizerIdAndStatus(organizerId, eventStatus, pageable);
        }

        return eventRepository.findByOrganizerId(organizerId, pageable);
    }

    /**
     * Search events
     */
    public Page<Event> searchEvents(Map<String, Object> searchParams, Pageable pageable) {
        log.info("Searching events with params: {}", searchParams);

        if (searchParams.containsKey("query")) {
            String query = (String) searchParams.get("query");
            return eventRepository.searchByName(query, pageable);
        }

        if (searchParams.containsKey("category")) {
            try {
                String category = (String) searchParams.get("category");
                Event.EventCategory eventCategory = Event.EventCategory.valueOf(category.toUpperCase());
                return eventRepository.findByCategory(eventCategory, LocalDateTime.now(), pageable);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid category value: {}", searchParams.get("category"));
                // Fall through to default behavior
            }
        }

        // If status filter is provided, use it
        if (searchParams.containsKey("status")) {
            try {
                String status = (String) searchParams.get("status");
                // Handle "ALL" status to return all events
                if ("ALL".equalsIgnoreCase(status)) {
                    return eventRepository.findAll(pageable);
                }
                Event.EventStatus eventStatus = Event.EventStatus.valueOf(status.toUpperCase());
                return eventRepository.findByStatus(eventStatus, pageable);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", searchParams.get("status"));
                // Fall through to default behavior
            }
        }

        // Default: return only PUBLISHED events for customer-facing views
        log.info("No status filter provided, defaulting to PUBLISHED events");
        return eventRepository.findByStatus(Event.EventStatus.PUBLISHED, pageable);
    }

    /**
     * Get featured events
     */
    @Cacheable(value = "featured-events")
    public List<Event> getFeaturedEvents(int limit) {
        log.info("Fetching featured events");
        return eventRepository.findFeaturedEvents(
                LocalDateTime.now(),
                Pageable.ofSize(limit));
    }

    /**
     * Delete event (soft delete)
     */
    @Transactional
    @CacheEvict(value = "events", key = "#id")
    public void deleteEvent(Long id) {
        log.info("Deleting event: {}", id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        eventRepository.delete(event);
    }
}
