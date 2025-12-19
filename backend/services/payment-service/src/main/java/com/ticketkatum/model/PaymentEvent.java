package com.ticketkatum.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentEvent extends BaseEvent {
    private String bookingId;
    private String paymentId;
    private String provider;
    private BigDecimal amount;
}
