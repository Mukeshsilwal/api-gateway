package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailsResponse {
    private TicketDto ticket;
    private BookingTicketDto booking;
    private SeatDto seat;
    private BusDto bus;
    private RouteDto route;
    private String journeyDate;
    private String passengerName;
}
