package com.ticketkatum.dto.payment.request;

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
public class PaymentRequest {
    private BigDecimal amount;
    private String currency;
    private String provider;
    private String failureUrl;
    private String successUrl;
    private String bookingId;
    private long hotelId;
    private Map<String, String> metadata;
}
