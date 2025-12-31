package com.ticketkatum.model;

import com.ticketkatum.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment confirmation event sent via ActiveMQ
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Booking session information
    private String bookingSessionId;
    private String bookingId;

    // Payment status
    private TransactionStatus status; // SUCCESS, FAILED, CANCELLED, PENDING

    // Payment details
    private String paymentId;
    private String transactionId;
    private String externalTxnId; // eSewa reference ID
    private BigDecimal amount;
    private String currency;
    private String paymentMethod; // ESEWA, KHALTI, etc.

    // Timestamps
    private LocalDateTime initiatedAt;
    private LocalDateTime verifiedAt;
    private Long timestamp;

    // Additional information
    private String errorMessage;
    private String errorCode;
    private String customerEmail;
    private String customerPhone;

    // Metadata
    private String ipAddress;
    private String userAgent;

}