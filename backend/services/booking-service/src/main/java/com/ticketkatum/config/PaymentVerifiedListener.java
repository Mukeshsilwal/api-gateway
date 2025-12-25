package com.ticketkatum.config;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentVerifiedListener {

    private final com.ticketkatum.abstractfactory.provider.factory.BookingProviderFactory bookingProviderFactory;

    @KafkaListener(topics = "payment-verified", groupId = "booking-service-group", containerFactory = "objectKafkaListenerContainerFactory")
    public void handlePaymentVerified(PaymentVerifiedEvent event) {
        try {
            log.info("📨 Received payment verified event from Kafka for booking {}", event.getBookingId());

            // Use factory to get the correct provider (HOTEL, EVENT, BUS)
            // Default provider to "standard" if null since factory expects it
            String providerName = event.getProvider() != null ? event.getProvider() : "standard";

            var provider = bookingProviderFactory.getProvider(event.getBookingType(), providerName);
            provider.confirmBooking(event.getBookingId(), event.getTransactionId());

        } catch (Exception e) {
            log.error("❌ Booking confirmation failed for {}", event.getBookingId(), e);
        }
    }

}
