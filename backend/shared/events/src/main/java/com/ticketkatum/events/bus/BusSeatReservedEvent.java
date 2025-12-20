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
 * Event published when bus seats are reserved.
 * Event Type: events.bus.seat.reserved.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BusSeatReservedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.bus.seat.reserved.v1";

    private BusSeatReservedPayload payload;

    public BusSeatReservedEvent(BusSeatReservedPayload payload) {
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
    public static class BusSeatReservedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
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
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private String status; // RESERVED, PENDING_PAYMENT
        private Instant reservedAt;
        private Integer expiryMinutes; // How long the reservation is held
        private String sessionId;
    }
}
