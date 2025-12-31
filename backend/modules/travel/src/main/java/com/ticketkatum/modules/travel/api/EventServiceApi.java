package com.ticketkatum.modules.travel.api;

import com.ticketkatum.entity.Event;
import com.ticketkatum.entity.TicketType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface EventServiceApi {
    Event createEvent(Map<String, Object> eventData);
    Event getEventById(Long id);
    Event getEventBySlug(String slug);
    Event updateEvent(Long id, Map<String, Object> updateData);
    Event publishEvent(Long id);
    Event cancelEvent(Long id, String reason);
    Page<Event> searchEvents(Map<String, Object> searchParams, Pageable pageable);
    List<Event> getFeaturedEvents(int limit);
    List<TicketType> getTicketTypes(Long eventId);
    void deleteEvent(Long id);
    Page<Event> getOrganizerEvents(Long organizerId, String status, Pageable pageable);
}
