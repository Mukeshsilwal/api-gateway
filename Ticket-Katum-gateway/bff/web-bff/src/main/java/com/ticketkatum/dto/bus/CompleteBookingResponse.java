package com.ticketkatum.dto.bus;

import com.ticketkatum.dto.payment.response.PaymentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingResponse {
    // Legacy fields
    private ReservationResponse reservation;
    private BookingTicketDto bookingTicket;
    private TicketDto ticket;
    private SeatDto seat;
    private BusDto bus;
    private String bookingReference;

    // Shared fields
    private String status;
    private String message;

    // New field
    private PaymentResponse paymentData;
}
