package com.ticketkatum.events;

import com.ticketkatum.events.payment.PaymentAuthorizedEvent;
import com.ticketkatum.events.payment.PaymentCapturedEvent;
import com.ticketkatum.events.payment.PaymentFailedEvent;
import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Enhanced payment event publisher using Kafka.
 * Publishes payment lifecycle events for async processing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnhancedPaymentEventPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish payment authorized event.
     * Called when payment gateway authorizes a payment.
     * 
     * @param paymentId            Payment ID
     * @param bookingId            Booking ID
     * @param customerId           Customer ID
     * @param amount               Payment amount
     * @param currency             Currency code
     * @param paymentMethod        Payment method (CARD, PAYPAL, WALLET)
     * @param gatewayTransactionId Gateway transaction ID
     * @param gateway              Payment gateway (STRIPE, PAYPAL, RAZORPAY)
     * @param authorizationCode    Authorization code from gateway
     * @param expiryMinutes        How long the authorization is valid
     */
    public void publishPaymentAuthorized(
            String paymentId,
            String bookingId,
            Long customerId,
            BigDecimal amount,
            String currency,
            String paymentMethod,
            String gatewayTransactionId,
            String gateway,
            String authorizationCode,
            Integer expiryMinutes) {

        log.info("Publishing payment authorized event for paymentId: {}, bookingId: {}",
                paymentId, bookingId);

        PaymentAuthorizedEvent.PaymentAuthorizedPayload payload = PaymentAuthorizedEvent.PaymentAuthorizedPayload
                .builder()
                .paymentId(paymentId)
                .bookingId(bookingId)
                .customerId(customerId)
                .amount(amount)
                .currency(currency != null ? currency : "USD")
                .paymentMethod(paymentMethod)
                .gatewayTransactionId(gatewayTransactionId)
                .gateway(gateway)
                .status("AUTHORIZED")
                .authorizedAt(Instant.now())
                .authorizationCode(authorizationCode)
                .expiryMinutes(expiryMinutes != null ? expiryMinutes : 30)
                .build();

        PaymentAuthorizedEvent event = new PaymentAuthorizedEvent(payload);
        event.setCausedBy("payment-service");

        // Use paymentId as partition key for ordering
        eventPublisher.publishEvent(event, paymentId);

        log.info("Payment authorized event published: eventId={}, paymentId={}",
                event.getEventId(), paymentId);
    }

    /**
     * Publish payment captured event.
     * Called when payment is successfully captured/settled.
     * 
     * @param paymentId            Payment ID
     * @param bookingId            Booking ID
     * @param customerId           Customer ID
     * @param capturedAmount       Amount captured
     * @param currency             Currency code
     * @param gatewayTransactionId Gateway transaction ID
     * @param gateway              Payment gateway
     * @param receiptUrl           Receipt URL
     * @param invoiceId            Invoice ID
     */
    public void publishPaymentCaptured(
            String paymentId,
            String bookingId,
            Long customerId,
            BigDecimal capturedAmount,
            String currency,
            String gatewayTransactionId,
            String gateway,
            String receiptUrl,
            String invoiceId) {

        log.info("Publishing payment captured event for paymentId: {}, bookingId: {}",
                paymentId, bookingId);

        PaymentCapturedEvent.PaymentCapturedPayload payload = PaymentCapturedEvent.PaymentCapturedPayload.builder()
                .paymentId(paymentId)
                .bookingId(bookingId)
                .customerId(customerId)
                .capturedAmount(capturedAmount)
                .currency(currency != null ? currency : "USD")
                .gatewayTransactionId(gatewayTransactionId)
                .gateway(gateway)
                .receiptUrl(receiptUrl)
                .capturedAt(Instant.now())
                .invoiceId(invoiceId)
                .build();

        PaymentCapturedEvent event = new PaymentCapturedEvent(payload);
        event.setCausedBy("payment-service");

        // Use paymentId as partition key for ordering
        eventPublisher.publishEvent(event, paymentId);

        log.info("Payment captured event published: eventId={}, paymentId={}, amount={}",
                event.getEventId(), paymentId, capturedAmount);
    }

    /**
     * Publish payment failed event.
     * Called when payment authorization or capture fails.
     * 
     * @param paymentId       Payment ID
     * @param bookingId       Booking ID
     * @param customerId      Customer ID
     * @param attemptedAmount Amount attempted
     * @param currency        Currency code
     * @param failureReason   Failure reason
     * @param failureCode     Failure code (INSUFFICIENT_FUNDS, CARD_DECLINED, etc.)
     * @param gateway         Payment gateway
     * @param retryAttempt    Current retry attempt number
     * @param willRetry       Whether the payment will be retried
     * @param nextRetryAt     When the next retry will occur
     */
    public void publishPaymentFailed(
            String paymentId,
            String bookingId,
            Long customerId,
            BigDecimal attemptedAmount,
            String currency,
            String failureReason,
            String failureCode,
            String gateway,
            Integer retryAttempt,
            Boolean willRetry,
            Instant nextRetryAt) {

        log.warn("Publishing payment failed event for paymentId: {}, bookingId: {}, reason: {}",
                paymentId, bookingId, failureReason);

        PaymentFailedEvent.PaymentFailedPayload payload = PaymentFailedEvent.PaymentFailedPayload.builder()
                .paymentId(paymentId)
                .bookingId(bookingId)
                .customerId(customerId)
                .attemptedAmount(attemptedAmount)
                .currency(currency != null ? currency : "USD")
                .failureReason(failureReason)
                .failureCode(failureCode)
                .gateway(gateway)
                .failedAt(Instant.now())
                .retryAttempt(retryAttempt != null ? retryAttempt : 0)
                .willRetry(willRetry != null ? willRetry : false)
                .nextRetryAt(nextRetryAt)
                .build();

        PaymentFailedEvent event = new PaymentFailedEvent(payload);
        event.setCausedBy("payment-service");

        // Use paymentId as partition key for ordering
        eventPublisher.publishEvent(event, paymentId);

        log.info("Payment failed event published: eventId={}, paymentId={}, retryAttempt={}",
                event.getEventId(), paymentId, retryAttempt);
    }
}
