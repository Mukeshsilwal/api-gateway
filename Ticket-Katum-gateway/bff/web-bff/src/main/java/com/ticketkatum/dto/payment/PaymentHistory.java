package com.ticketkatum.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistory {
    private String transactionId;
    private String bookingReference;
    private java.math.BigDecimal amount;
    private String status;
    private String paymentMethod;
    private LocalDateTime paymentDate;
}
