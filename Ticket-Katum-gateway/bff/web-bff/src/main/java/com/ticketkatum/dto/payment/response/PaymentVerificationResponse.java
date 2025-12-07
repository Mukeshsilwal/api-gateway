package com.ticketkatum.dto.payment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResponse {
    private boolean verified;
    private String status;
    private String message;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private Map<String, Object> details;
}
