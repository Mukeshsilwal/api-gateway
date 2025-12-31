package com.ticketkatum.payment.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Unified payment response for all payment providers (eSewa, Khalti, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    /**
     * Payment status: INITIATED, SUCCESS, FAILED, PENDING, EXPIRED
     */
    private String status;

    /**
     * Human-readable message about the payment
     */
    private String message;

    /**
     * Provider-specific response data (gatewayUrl, pidx, payment_url, etc.)
     */
    private Object data;

    /**
     * Internal transaction ID
     */
    private String transactionId;

    /**
     * Payment amount in NPR
     */
    private BigDecimal amount;

    /**
     * Payment provider name (esewa, khalti, etc.)
     */
    private String provider;

    /**
     * Provider's transaction ID (pidx for Khalti, etc.)
     */
    private String providerTxnId;

    /**
     * Timestamp of the response
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}