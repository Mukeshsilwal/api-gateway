package com.ticketkatum.listener;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import com.ticketkatum.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka Listener for payment verification events.
 * Listens to payment-verified topic and updates booking status when payment is
 * confirmed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentVerificationListener {

    private final BookingService bookingService;

    /**
     * Handle payment verified event from Kafka.
     * Updates event booking status to CONFIRMED when payment is successfully
     * verified.
     *
     * @param event PaymentVerifiedEvent containing payment and booking details
     */
    @KafkaListener(topics = "payment-verified", groupId = "event-service-group")
    public void handlePaymentVerified(PaymentVerifiedEvent event) {
        log.info("📨 Received payment verified event from Kafka for booking: {}, type: {}",
                event.getBookingId(), event.getBookingType());

        try {
            // Only process EVENT bookings in event-service
            if ("EVENT".equalsIgnoreCase(event.getBookingType())) {
                log.info("✅ Processing EVENT booking payment: {}", event.getBookingId());

                // Confirm the booking
                bookingService.confirmBooking(
                        event.getBookingId(),
                        event.getTransactionId(),
                        event.getExternalTransactionId());

                log.info("🎉 Event booking confirmed successfully: {}", event.getBookingId());
            } else {
                log.debug("⏭️ Skipping non-EVENT booking: {} (type: {})",
                        event.getBookingId(), event.getBookingType());
            }
        } catch (Exception e) {
            log.error("❌ Failed to process payment verification for booking: {}",
                    event.getBookingId(), e);
            // TODO: Implement retry mechanism or dead letter topic
            throw new RuntimeException("Payment verification processing failed", e);
        }
    }
}
