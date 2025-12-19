package com.ticketkatum.market.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {
    private String paymentMethod; // e.g., "BUNDLE_CREDIT"
    private String transactionId;
}
