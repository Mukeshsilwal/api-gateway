package com.ticketkatum.events.hotel;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class HotelBookingConfirmedEvent extends BaseEvent {

    private HotelBookingPayload payload;

    public HotelBookingConfirmedEvent(HotelBookingPayload payload) {
        initializeBaseFields("bookings.hotel.confirmed.v1");
        this.payload = payload;
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelBookingPayload {
        private String bookingId;
        private String hotelName;
        private String roomType;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private BigDecimal totalAmount;
        private String customerEmail;
        private String confirmationNumber;
    }
}
