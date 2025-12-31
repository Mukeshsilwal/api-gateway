package com.ticketkatum.dto.payment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStatusResponse {
    private String transactionId;
    private String status;
    private String message;
    private BigDecimal amount;
    private String provider;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
