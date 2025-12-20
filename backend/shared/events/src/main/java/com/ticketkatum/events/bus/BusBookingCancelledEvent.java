package com.ticketkatum.events.bus;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Event published when bus booking is cancelled.
 * Event Type: events.bus.booking.cancelled.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BusBookingCancelledEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.bus.booking.cancelled.v1";

    private BusBookingCancelledPayload payload;

    public BusBookingCancelledEvent(BusBookingCancelledPayload payload) {
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
    public static class BusBookingCancelledPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private Long busId;
        private String busName;
        private String ticketNumber;
        private String confirmationNumber;
        private String cancellationReason;
        private String cancellationCode; // CUSTOMER_REQUEST, SCHEDULE_CHANGE, EMERGENCY
        private BigDecimal refundAmount;
        private BigDecimal cancellationFee;
        private Instant cancelledAt;
        private String cancelledBy; // CUSTOMER, ADMIN, SYSTEM
        private Boolean isRefundable;
        private Integer refundProcessingDays;
        private Integer hoursBeforeDeparture; // For calculating cancellation fee
    }
}
