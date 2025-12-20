package com.ticketkatum.events;

import com.ticketkatum.events.publisher.EventPublisher;
import com.ticketkatum.events.ticket.TicketsPublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Publisher for ticket-related events.
 * Handles publishing of ticket publishing events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TicketPublishedPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish tickets published event.
     * 
     * @param eventId ID of the event
     * @param eventName Name of the event
     * @param ticketTypes List of ticket type information
     * @param totalInventory Total number of tickets
     * @param saleStartTime When ticket sales start
     * @param saleEndTime When ticket sales end
     * @param dynamicPricingEnabled Whether dynamic pricing is enabled
     */
    public void publishTicketsPublished(
            Long eventId,
            String eventName,
            List<TicketTypeDto> ticketTypes,
            Integer totalInventory,
            LocalDateTime saleStartTime,
            LocalDateTime saleEndTime,
            Boolean dynamicPricingEnabled) {
        
        log.info("Publishing tickets published event for eventId: {}", eventId);
        
        List<TicketsPublishedEvent.TicketTypeInfo> ticketTypeInfos = ticketTypes.stream()
                .map(dto -> TicketsPublishedEvent.TicketTypeInfo.builder()
                        .ticketTypeId(dto.getTicketTypeId())
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .price(dto.getPrice())
                        .quantity(dto.getQuantity())
                        .maxPerOrder(dto.getMaxPerOrder())
                        .tier(dto.getTier())
                        .build())
                .collect(Collectors.toList());
        
        TicketsPublishedEvent.TicketsPublishedPayload payload = 
            TicketsPublishedEvent.TicketsPublishedPayload.builder()
                .eventId(eventId)
                .eventName(eventName)
                .ticketTypes(ticketTypeInfos)
                .totalInventory(totalInventory)
                .saleStartTime(saleStartTime)
                .saleEndTime(saleEndTime)
                .publishedAt(Instant.now())
                .dynamicPricingEnabled(dynamicPricingEnabled != null ? dynamicPricingEnabled : false)
                .build();
        
        TicketsPublishedEvent event = new TicketsPublishedEvent(payload);
        event.setCausedBy("event-service");
        
        // Use eventId as partition key for ordering
        eventPublisher.publishEvent(event, eventId.toString());
        
        log.info("Tickets published event published: eventId={}, totalInventory={}", 
                event.getEventId(), totalInventory);
    }

    /**
     * DTO for ticket type information
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TicketTypeDto {
        private Long ticketTypeId;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer quantity;
        private Integer maxPerOrder;
        private String tier;
    }
}
