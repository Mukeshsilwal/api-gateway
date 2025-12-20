package com.ticketkatum.events.hotel;

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
 * Event published when hotel booking is cancelled.
 * Event Type: events.hotel.booking.cancelled.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HotelBookingCancelledEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.hotel.booking.cancelled.v1";

    private HotelBookingCancelledPayload payload;

    public HotelBookingCancelledEvent(HotelBookingCancelledPayload payload) {
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
    public static class HotelBookingCancelledPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private Long hotelId;
        private String hotelName;
        private String confirmationNumber;
        private String cancellationReason;
        private String cancellationCode; // CUSTOMER_REQUEST, NO_SHOW, POLICY_VIOLATION
        private BigDecimal refundAmount;
        private BigDecimal cancellationFee;
        private Instant cancelledAt;
        private String cancelledBy; // CUSTOMER, ADMIN, SYSTEM
        private Boolean isRefundable;
        private Integer refundProcessingDays;
    }
}
