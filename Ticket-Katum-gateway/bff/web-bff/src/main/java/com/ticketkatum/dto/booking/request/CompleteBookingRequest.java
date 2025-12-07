package com.ticketkatum.dto.booking.request;

import com.ticketkatum.dto.hotel.request.HotelBookingRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {
    private HotelBookingRequest bookingRequest;
    private PaymentRequest paymentRequest;
    private String userId;
    private String sessionId;
}
