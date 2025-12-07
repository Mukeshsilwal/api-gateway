package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedBookingDetails {
    private BookingTicketDto booking;
    private TicketDto ticket;
    private SeatDto seat;
    private String status;
    private BusDto bus;
    private boolean canCancel;
    private String cancellationDeadline;
}
