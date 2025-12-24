package com.ticketkatum.config;

import com.ticketkatum.abstractfactory.hotel.service.GenericHotelService;
import com.ticketkatum.dto.PaymentVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentVerifiedListener {

    private final GenericHotelService bookingService;

    @KafkaListener(topics = "payment-verified", groupId = "booking-service-group")
    public void handlePaymentVerified(PaymentVerifiedEvent event) {
        try {
            log.info("📨 Received payment verified event from Kafka for booking {}", event.getBookingId());
            bookingService.confirmBooking(event.getBookingId());
        } catch (Exception e) {
            log.error("❌ Booking confirmation failed for {}", event.getBookingId(), e);
        }
    }

}
