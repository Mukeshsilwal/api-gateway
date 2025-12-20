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
import java.time.LocalDate;

/**
 * Event published when hotel booking is confirmed after payment.
 * Event Type: events.hotel.booking.confirmed.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HotelBookingConfirmedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.hotel.booking.confirmed.v1";

    private HotelBookingConfirmedPayload payload;

    public HotelBookingConfirmedEvent(HotelBookingConfirmedPayload payload) {
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
    public static class HotelBookingConfirmedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private String customerName;
        private Long hotelId;
        private String hotelName;
        private String hotelAddress;
        private String roomNumbers; // Comma-separated room numbers
        private String confirmationNumber;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer numberOfRooms;
        private Integer numberOfGuests;
        private BigDecimal totalAmount;
        private String paymentId;
        private Instant confirmedAt;
        private String bookingVoucherUrl;
    }
}
