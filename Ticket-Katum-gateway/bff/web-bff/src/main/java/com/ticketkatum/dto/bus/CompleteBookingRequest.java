package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {
    private Integer seatId;
    private BookingRequestDto bookingRequest;
    private BookingTicketDto bookingTicket;
    private TicketDto ticketDto;
}