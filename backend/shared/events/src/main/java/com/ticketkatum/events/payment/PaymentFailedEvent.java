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
 * Event published when payment fails.
 * Event Type: events.payment.failed.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentFailedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.payment.failed.v1";

    private PaymentFailedPayload payload;

    public PaymentFailedEvent(PaymentFailedPayload payload) {
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
    public static class PaymentFailedPayload {
        private String paymentId;
        private String bookingId;
        private Long customerId;
        private BigDecimal attemptedAmount;
        private String currency;
        private String failureReason;
        private String failureCode; // INSUFFICIENT_FUNDS, CARD_DECLINED, etc.
        private String gateway;
        private Instant failedAt;
        private Integer retryAttempt;
        private Boolean willRetry;
        private Instant nextRetryAt;
    }
}
