package com.ticketkatum.service;

import com.ticketkatum.entity.Event;
import com.ticketkatum.entity.TicketType;
import com.ticketkatum.repository.EventRepository;
import com.ticketkatum.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventCloneService {

    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;

    @Transactional
    public Event cloneEvent(Long eventId) {
        log.info("Cloning event: {}", eventId);

        Event original = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Create cloned event
        Event cloned = new Event();

        // Copy basic info
        cloned.setName(original.getName() + " (Copy)");
        cloned.setDescription(original.getDescription());
        cloned.setCategory(original.getCategory());
        cloned.setType(original.getType());
        cloned.setCoverImage(original.getCoverImage());
        cloned.setTags(original.getTags());

        // Reset dates (set to null, organizer must update)
        cloned.setStartDateTime(null);
        cloned.setEndDateTime(null);

        // Copy venue info
        cloned.setVenue(original.getVenue());

        // Reset status to DRAFT
        cloned.setStatus(Event.EventStatus.DRAFT);

        // Copy organizer
        cloned.setOrganizer(original.getOrganizer());

        // Save cloned event
        Event savedEvent = eventRepository.save(cloned);

        // Clone ticket types
        List<TicketType> originalTickets = ticketTypeRepository.findByEventIdOrderBySortOrderAsc(eventId);
        List<TicketType> clonedTickets = new ArrayList<>();

        for (TicketType originalTicket : originalTickets) {
            TicketType clonedTicket = new TicketType();
            clonedTicket.setEvent(savedEvent);
            clonedTicket.setName(originalTicket.getName());
            clonedTicket.setDescription(originalTicket.getDescription());
            clonedTicket.setPrice(originalTicket.getPrice());
            clonedTicket.setQuantity(originalTicket.getQuantity());
            clonedTicket.setQuantitySold(0); // Reset sold quantity
            clonedTicket.setAvailableFrom(null); // Reset sale dates
            clonedTicket.setAvailableTo(null);
            clonedTicket.setBenefits(originalTicket.getBenefits());
            clonedTicket.setColor(originalTicket.getColor());
            clonedTicket.setSortOrder(originalTicket.getSortOrder());
            clonedTicket.setIsActive(true);

            clonedTickets.add(clonedTicket);
        }

        ticketTypeRepository.saveAll(clonedTickets);

        log.info("Event cloned successfully. New event ID: {}", savedEvent.getId());
        return savedEvent;
    }
}
