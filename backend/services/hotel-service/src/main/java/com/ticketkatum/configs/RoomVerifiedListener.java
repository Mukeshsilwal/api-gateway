package com.ticketkatum.configs;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import com.ticketkatum.service.serviceimpl.HotelRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
@Component
@Slf4j
@RequiredArgsConstructor
public class RoomVerifiedListener {

    private final HotelRecommendationService hotelRecommendationService;

    @JmsListener(
            destination = "payment.verified.queue",
            containerFactory = "jmsListenerContainerFactory"
    )
    public void handlePaymentVerified(PaymentVerifiedEvent event) {
        try {
            log.info("Received payment verified event for booking {}", event.getHotelId());
            hotelRecommendationService.bookedSeat(event.getHotelId());
        } catch (Exception e) {
            log.error("Booking confirmation failed for {}", event.getBookingId(), e);
        }
    }
}

