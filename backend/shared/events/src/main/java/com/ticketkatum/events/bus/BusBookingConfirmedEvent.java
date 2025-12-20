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
import java.time.LocalDateTime;

/**
 * Event published when bus booking is confirmed after payment.
 * Event Type: events.bus.booking.confirmed.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BusBookingConfirmedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.bus.booking.confirmed.v1";

    private BusBookingConfirmedPayload payload;

    public BusBookingConfirmedEvent(BusBookingConfirmedPayload payload) {
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
    public static class BusBookingConfirmedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private String customerName;
        private String customerPhone;
        private Long busId;
        private String busName;
        private String busNumber;
        private String route;
        private String departureCity;
        private String arrivalCity;
        private String seatNumbers; // Comma-separated seat numbers
        private Integer numberOfSeats;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private String boardingPoint;
        private String droppingPoint;
        private String confirmationNumber;
        private String ticketNumber;
        private BigDecimal totalAmount;
        private String paymentId;
        private Instant confirmedAt;
        private String ticketDownloadUrl;
    }
}
