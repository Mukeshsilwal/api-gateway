package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingResponse {
    private ReservationResponse reservation;
    private BookingTicketDto bookingTicket;
    private TicketDto ticket;
    private SeatDto seat;
    private BusDto bus;
    private String bookingReference;
    private String status;
    private String message;
}
