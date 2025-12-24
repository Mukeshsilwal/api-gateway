package com.ticketkatum.consumer;

import com.ticketkatum.events.booking.BookingConfirmedEvent;
import com.ticketkatum.events.booking.BookingInitiatedEvent;
import com.ticketkatum.events.payment.PaymentCapturedEvent;
import com.ticketkatum.events.payment.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Example analytics event consumer.
 * Tracks all events for metrics and reporting.
 * 
 * Usage: Add this to any service that needs analytics tracking.
 * Requires: shared-events dependency and Kafka consumer configuration.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsEventConsumer {

    // Inject your analytics repository/service here
    // private final AnalyticsService analyticsService;

    /**
     * Track booking initiated events.
     * Metrics: booking attempts, conversion funnel, popular events
     */
    @KafkaListener(
        topics = "events.booking.initiated.v1",
        groupId = "${spring.application.name}-analytics",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleBookingInitiated(
            @Payload BookingInitiatedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (BookingInitiatedEvent.BookingInitiatedPayload) event.getPayload();
            
            log.info("Analytics: Booking initiated - eventId={}, customerId={}, amount={}", 
                    payload.getEventId(), 
                    payload.getCustomerId(),
                    payload.getTotalAmount());
            
            // Track metrics
//             analyticsService.trackBookingInitiated(event.getPayload());
            
            // Example metrics to track:
            // - Total bookings initiated
            // - Average booking amount
            // - Popular events
            // - Conversion rate (initiated -> confirmed)
            
            // Acknowledge message
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing booking initiated event", e);
            // Don't acknowledge - message will be retried
        }
    }

    /**
     * Track booking confirmed events.
     * Metrics: successful bookings, revenue, customer behavior
     */
    @KafkaListener(
        topics = "events.booking.confirmed.v1",
        groupId = "${spring.application.name}-analytics",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleBookingConfirmed(
            @Payload BookingConfirmedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (BookingConfirmedEvent.BookingConfirmedPayload) event.getPayload();
            
            log.info("Analytics: Booking confirmed - bookingId={}, revenue={}", 
                    payload.getBookingId(),
                    payload.getTotalAmount());
            
            // Track metrics
            // analyticsService.trackBookingConfirmed(event.getPayload());
            
            // Example metrics:
            // - Total revenue
            // - Bookings per event
            // - Customer lifetime value
            // - Peak booking times
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing booking confirmed event", e);
        }
    }

    /**
     * Track payment events.
     * Metrics: payment success rate, failed payment reasons
     */
    @KafkaListener(
        topics = "events.payment.captured.v1",
        groupId = "${spring.application.name}-analytics",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentCaptured(
            @Payload PaymentCapturedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (PaymentCapturedEvent.PaymentCapturedPayload) event.getPayload();
            
            log.info("Analytics: Payment captured - paymentId={}, amount={}", 
                    payload.getPaymentId(),
                    payload.getCapturedAmount());
            
            // Track payment success metrics
            // analyticsService.trackPaymentSuccess(event.getPayload());
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing payment captured event", e);
        }
    }

    @KafkaListener(
        topics = "events.payment.failed.v1",
        groupId = "${spring.application.name}-analytics",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentFailed(
            @Payload PaymentFailedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (PaymentFailedEvent.PaymentFailedPayload) event.getPayload();
            
            log.warn("Analytics: Payment failed - paymentId={}, reason={}", 
                    payload.getPaymentId(),
                    payload.getFailureReason());
            
            // Track payment failure metrics
            // analyticsService.trackPaymentFailure(event.getPayload());
            
            // Example metrics:
            // - Failure rate by gateway
            // - Common failure reasons
            // - Retry success rate
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing payment failed event", e);
        }
    }

    /**
     * Batch processing example for high-throughput scenarios.
     * Use batchKafkaListenerContainerFactory for better performance.
     */
    /*
    @KafkaListener(
        topics = "events.booking.initiated.v1",
        groupId = "${spring.application.name}-analytics-batch",
        containerFactory = "batchKafkaListenerContainerFactory"
    )
    public void handleBookingInitiatedBatch(
            List<BookingInitiatedEvent> events,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("Processing batch of {} booking events", events.size());
            
            // Batch process for better performance
            analyticsService.trackBookingsBatch(events);
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing booking batch", e);
        }
    }
    */
}
