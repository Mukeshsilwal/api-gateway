package com.ticketkatum.events.ticket;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Event published when tickets are published for sale.
 * Event Type: events.tickets.published.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TicketsPublishedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.tickets.published.v1";

    private TicketsPublishedPayload payload;

    public TicketsPublishedEvent(TicketsPublishedPayload payload) {
        this.payload = payload;
        initializeBaseFields(EVENT_TYPE);
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketsPublishedPayload {
        private Long eventId;
        private String eventName;
        private List<TicketTypeInfo> ticketTypes;
        private Integer totalInventory;
        private LocalDateTime saleStartTime;
        private LocalDateTime saleEndTime;
        private Instant publishedAt;
        private Boolean dynamicPricingEnabled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketTypeInfo {
        private Long ticketTypeId;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer quantity;
        private Integer maxPerOrder;
        private String tier; // VIP, GENERAL, EARLY_BIRD, etc.
    }
}
