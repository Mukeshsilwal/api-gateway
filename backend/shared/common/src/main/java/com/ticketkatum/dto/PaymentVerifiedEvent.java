package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentVerifiedEvent {

    private String bookingId;
    private String transactionId;
    private long hotelId;
    private BigDecimal amount;
    private String provider;
    private LocalDateTime verifiedAt;
}

