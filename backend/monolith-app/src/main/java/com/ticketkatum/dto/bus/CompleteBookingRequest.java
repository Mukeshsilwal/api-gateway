package com.ticketkatum.dto.bus;

import com.ticketkatum.dto.payment.request.PaymentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {
    // Legacy fields for BookingSeatAggregator
    private Integer seatId;
    private BookingRequestDto bookingRequest;
    private BookingTicketDto bookingTicket; // Also used for new flow
    private TicketDto ticketDto;

    // New field for BusAggregator
    private PaymentRequest paymentDetails;
}