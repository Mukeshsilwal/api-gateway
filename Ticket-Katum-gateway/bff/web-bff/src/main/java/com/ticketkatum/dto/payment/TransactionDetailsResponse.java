package com.ticketkatum.dto.payment;

import com.ticketkatum.dto.payment.response.TransactionStatusResponse;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TransactionDetailsResponse {
    private TransactionStatusResponse transactionStatus;
}
