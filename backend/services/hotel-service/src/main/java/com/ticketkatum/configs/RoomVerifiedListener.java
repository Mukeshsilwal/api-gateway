package com.ticketkatum.configs;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import com.ticketkatum.service.serviceimpl.HotelRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class RoomVerifiedListener {

    private final HotelRecommendationService hotelRecommendationService;

    @KafkaListener(topics = "payment-verified", groupId = "hotel-service-group")
    public void handlePaymentVerified(PaymentVerifiedEvent event) {
        try {
            log.info("📨 Received payment verified event from Kafka for hotel {}", event.getHotelId());
            hotelRecommendationService.bookedSeat(event.getHotelId());
        } catch (Exception e) {
            log.error("❌ Booking confirmation failed for {}", event.getBookingId(), e);
        }
    }
}
