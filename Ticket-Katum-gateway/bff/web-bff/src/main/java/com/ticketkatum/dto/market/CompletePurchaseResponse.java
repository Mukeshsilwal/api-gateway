package com.ticketkatum.dto.market;

import com.ticketkatum.dto.payment.response.PaymentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletePurchaseResponse {
    private ResaleTransaction transaction;
    private PaymentResponse paymentData;
    private String message;
    private int status;
}
