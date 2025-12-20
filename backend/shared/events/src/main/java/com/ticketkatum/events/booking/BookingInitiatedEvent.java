package com.ticketkatum.events.booking;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Event published when a customer initiates a booking.
 * Event Type: events.booking.initiated.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BookingInitiatedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.booking.initiated.v1";

    private BookingInitiatedPayload payload;

    public BookingInitiatedEvent(BookingInitiatedPayload payload) {
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
    public static class BookingInitiatedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private Long eventId;
        private String eventName;
        private List<TicketSelection> ticketSelections;
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;
        private String promoCode;
        private String status; // INITIATED, PENDING_PAYMENT
        private Instant initiatedAt;
        private String sessionId;
        private Integer expiryMinutes; // How long the booking is held
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketSelection {
        private Long ticketTypeId;
        private String ticketTypeName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
