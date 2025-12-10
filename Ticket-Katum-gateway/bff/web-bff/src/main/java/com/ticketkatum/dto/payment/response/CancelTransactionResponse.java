package com.ticketkatum.dto.payment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelTransactionResponse {
    private String transactionId;
    private boolean cancelled;
    private String message;
    private String reason;
}
