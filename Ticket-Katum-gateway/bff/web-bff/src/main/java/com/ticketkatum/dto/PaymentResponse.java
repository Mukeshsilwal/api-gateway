package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String paymentId;
    private String bookingId;
    private String userId;
    private Double amount;
    private String currency;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
    private String paymentMethod;
    private String transactionId;
    private String paymentUrl; // For redirecting to payment gateway
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

