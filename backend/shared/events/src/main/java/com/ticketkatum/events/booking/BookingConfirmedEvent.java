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
 * Event published when a booking is confirmed after successful payment.
 * Event Type: events.booking.confirmed.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BookingConfirmedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.booking.confirmed.v1";

    private BookingConfirmedPayload payload;

    public BookingConfirmedEvent(BookingConfirmedPayload payload) {
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
    public static class BookingConfirmedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private String customerName;
        private Long eventId;
        private String eventName;
        private List<TicketInfo> tickets;
        private List<String> qrCodes;
        private String confirmationNumber;
        private BigDecimal totalAmount;
        private String paymentId;
        private Instant confirmedAt;
        private String ticketDownloadUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketInfo {
        private String ticketId;
        private String ticketTypeName;
        private String qrCode;
        private String seatNumber;
        private String section;
    }
}
