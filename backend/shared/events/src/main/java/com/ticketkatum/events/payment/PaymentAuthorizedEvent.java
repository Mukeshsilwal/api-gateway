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
 * Event published when payment is authorized.
 * Event Type: events.payment.authorized.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentAuthorizedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.payment.authorized.v1";

    private PaymentAuthorizedPayload payload;

    public PaymentAuthorizedEvent(PaymentAuthorizedPayload payload) {
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
    public static class PaymentAuthorizedPayload {
        private String paymentId;
        private String bookingId;
        private Long customerId;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod; // CARD, PAYPAL, WALLET
        private String gatewayTransactionId;
        private String gateway; // STRIPE, PAYPAL, RAZORPAY
        private String status; // AUTHORIZED
        private Instant authorizedAt;
        private String authorizationCode;
        private Integer expiryMinutes; // How long the authorization is valid
    }
}
