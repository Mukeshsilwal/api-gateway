package com.ticketkatum.dto.payment.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentRequest {
    private BigDecimal amount;
    private String currency;
    private String provider;
    private String failureUrl;
    private String successUrl;

    @JsonAlias({"tid", "bookingReference"})
    private String bookingId;

    private long hotelId;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Map<String, Object> metadata;
}

