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
 * Event published when hotel rooms are reserved.
 * Event Type: events.hotel.room.reserved.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class HotelRoomReservedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.hotel.room.reserved.v1";

    private HotelRoomReservedPayload payload;

    public HotelRoomReservedEvent(HotelRoomReservedPayload payload) {
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
    public static class HotelRoomReservedPayload {
        private String bookingId;
        private Long customerId;
        private String customerEmail;
        private Long hotelId;
        private String hotelName;
        private Long roomTypeId;
        private String roomTypeName;
        private Integer numberOfRooms;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private String status; // RESERVED, PENDING_PAYMENT
        private Instant reservedAt;
        private Integer expiryMinutes; // How long the reservation is held
        private String sessionId;
    }
}
