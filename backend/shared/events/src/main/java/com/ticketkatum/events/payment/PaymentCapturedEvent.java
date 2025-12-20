package com.ticketkatum.events.payment;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Event published when payment is captured.
 * Event Type: events.payment.captured.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentCapturedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.payment.captured.v1";

    private PaymentCapturedPayload payload;

    public PaymentCapturedEvent(PaymentCapturedPayload payload) {
        this.payload = payload;
        initializeBaseFields(EVENT_TYPE);
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentCapturedPayload {
        private String paymentId;
        private String bookingId;
        private Long customerId;
        private BigDecimal capturedAmount;
        private String currency;
        private String gatewayTransactionId;
        private String gateway;
        private String receiptUrl;
        private Instant capturedAt;
        private String invoiceId;
    }
}
