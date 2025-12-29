package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {
    private String paymentMethod;
    private Double amount;
    private String currency;
    private String transactionId;
    private String method;
    private String status;
}