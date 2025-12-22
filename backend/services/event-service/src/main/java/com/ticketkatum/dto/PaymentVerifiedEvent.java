package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event received from ActiveMQ when payment is verified.
 * This is a duplicate of the payment-service DTO for deserialization.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifiedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String bookingId;
    private String transactionId;
    private Long merchantId;
    private BigDecimal amount;
    private String provider;
    private LocalDateTime verifiedAt;
    private String bookingType;
    private String externalTransactionId;
    private String metadata;
}
