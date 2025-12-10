package com.ticketkatum.dto.payment.response;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class PaymentInitiationResponse {
    private PaymentResponse paymentResponse;
    private String bookingId;
    private String provider;
}
