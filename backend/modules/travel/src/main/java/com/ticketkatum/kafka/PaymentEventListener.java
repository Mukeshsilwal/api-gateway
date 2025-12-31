package com.ticketkatum.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Kafka Event Listener for Payment Confirmation
 * Listens to payment.confirmed topic and updates booking status
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final BookingService bookingService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "payment.confirmed", groupId = "event-service")
    public void handlePaymentConfirmed(String message) {
        try {
            log.info("Received payment confirmation event: {}", message);

            // Parse the Kafka message
            Map<String, Object> event = objectMapper.readValue(message, Map.class);

            String bookingReference = (String) event.get("bookingId");
            String transactionId = (String) event.get("transactionId");
            String bookingType = (String) event.get("bookingType");

            // Only process EVENT bookings
            if ("EVENT".equals(bookingType)) {
                log.info("Confirming payment for event booking: {}, transaction: {}",
                        bookingReference, transactionId);

                // Call BookingService to confirm payment
                bookingService.confirmPayment(bookingReference, transactionId);

                log.info("Successfully confirmed payment for booking: {}", bookingReference);
            } else {
                log.debug("Ignoring non-event booking type: {}", bookingType);
            }

        } catch (Exception e) {
            log.error("Error processing payment confirmation event", e);
            // Don't rethrow - we don't want to stop the Kafka consumer
            // Consider adding a dead letter queue or retry mechanism
        }
    }
}
