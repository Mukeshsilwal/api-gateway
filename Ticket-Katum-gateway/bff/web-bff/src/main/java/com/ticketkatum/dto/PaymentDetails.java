package com.ticketkatum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, ESEWA, KHALTI

    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
}
