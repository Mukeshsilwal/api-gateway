package com.ticketkatum.dto.booking.request;

import com.ticketkatum.dto.hotel.request.HotelBookingRequest;
import com.ticketkatum.dto.payment.request.PaymentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {
    private HotelBookingRequest bookingRequest;
    private PaymentRequest paymentRequest;
    private String userId;
    private List<Long> roomIds;
    private String category;
    private String service;
    private String sessionId;
}
