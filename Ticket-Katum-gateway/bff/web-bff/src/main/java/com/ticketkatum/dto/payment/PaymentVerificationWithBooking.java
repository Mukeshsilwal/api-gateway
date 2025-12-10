package com.ticketkatum.dto.payment;

import com.ticketkatum.dto.payment.response.PaymentVerificationResponse;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class PaymentVerificationWithBooking {
    private PaymentVerificationResponse verificationResponse;
    private boolean bookingUpdated;
}
