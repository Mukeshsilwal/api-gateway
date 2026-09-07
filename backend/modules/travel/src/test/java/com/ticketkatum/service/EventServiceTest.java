package com.ticketkatum.service;

import com.ticketkatum.entity.Event;
import com.ticketkatum.entity.Organizer;
import com.ticketkatum.repository.EventRepository;
import com.ticketkatum.repository.OrganizerRepository;
import com.ticketkatum.repository.TicketTypeRepository;
import com.ticketkatum.util.SlugGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private OrganizerRepository organizerRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private SlugGenerator slugGenerator;

    @InjectMocks
    private EventService eventService;

    private Organizer testOrganizer;
    private Event testDraftEvent;
    private Event testPublishedEvent;

    @BeforeEach
    void setUp() {
        testOrganizer = Organizer.builder()
                .id(1L)
                .userId(100L)
                .organizationName("Kathmandu Events Pvt Ltd")
                .build();

        testDraftEvent = Event.builder()
                .id(10L)
                .name("Himalayan Music Carnival")
                .slug("himalayan-music-carnival")
                .status(Event.EventStatus.DRAFT)
                .category(Event.EventCategory.MUSIC)
                .organizer(testOrganizer)
                .startDateTime(LocalDateTime.now().plusDays(10))
                .endDateTime(LocalDateTime.now().plusDays(12))
                .views(0L)
                .build();

        testPublishedEvent = Event.builder()
                .id(11L)
                .name("Tech Horizon 2026")
                .slug("tech-horizon-2026")
                .status(Event.EventStatus.PUBLISHED)
                .category(Event.EventCategory.CONFERENCE)
                .organizer(testOrganizer)
                .startDateTime(LocalDateTime.now().plusDays(20))
                .endDateTime(LocalDateTime.now().plusDays(22))
                .views(50L)
                .build();
    }

    @Test
    @DisplayName("Admin: Approve and publish draft event")
    void testPublishEvent_Success() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(testDraftEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event published = eventService.publishEvent(10L);

        assertNotNull(published);
        assertEquals(Event.EventStatus.PUBLISHED, published.getStatus());
        assertNotNull(published.getPublishedAt());
        verify(eventRepository, times(1)).save(testDraftEvent);
    }

    @Test
    @DisplayName("Admin: Reject/Cancel event with reason")
    void testCancelEvent_Success() {
        when(eventRepository.findById(11L)).thenReturn(Optional.of(testPublishedEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event cancelled = eventService.cancelEvent(11L, "Bad weather forecast");

        assertNotNull(cancelled);
        assertEquals(Event.EventStatus.CANCELLED, cancelled.getStatus());
        verify(eventRepository, times(1)).save(testPublishedEvent);
    }

    @Test
    @DisplayName("User: Retrieve event by ID increments views")
    void testGetEventById_Success() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(testDraftEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event result = eventService.getEventById(10L);

        assertNotNull(result);
        assertEquals("Himalayan Music Carnival", result.getName());
        assertEquals(1L, result.getViews());
        verify(eventRepository, times(1)).save(testDraftEvent);
    }

    @Test
    @DisplayName("User: Search events by keyword query")
    void testSearchEvents_ByQuery() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Event> eventPage = new PageImpl<>(List.of(testPublishedEvent));

        when(eventRepository.searchByName(eq("Tech"), eq(pageable))).thenReturn(eventPage);

        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("query", "Tech");

        Page<Event> result = eventService.searchEvents(searchParams, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Tech Horizon 2026", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Admin: Search events with ALL status returns all events")
    void testSearchEvents_AllStatusAdmin() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Event> eventPage = new PageImpl<>(List.of(testDraftEvent, testPublishedEvent));

        when(eventRepository.findAll(pageable)).thenReturn(eventPage);

        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("status", "ALL");

        Page<Event> result = eventService.searchEvents(searchParams, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        verify(eventRepository, times(1)).findAll(pageable);
    }
}
