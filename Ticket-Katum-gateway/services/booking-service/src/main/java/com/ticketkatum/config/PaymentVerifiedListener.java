package com.ticketkatum.config;

import com.ticketkatum.abstractfactory.hotel.service.GenericHotelService;
import com.ticketkatum.dto.PaymentVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentVerifiedListener {

    private final GenericHotelService bookingService;

    @JmsListener(
            destination = "payment.verified",
            containerFactory = "jmsListenerContainerFactory"
    )
    public void handlePaymentVerified(PaymentVerifiedEvent event) {

        log.info("Received payment verified event for booking {}", event.getBookingId());

        try {
            bookingService.confirmBooking(event.getBookingId());
        } catch (Exception e) {
            log.error("Failed to confirm booking {}", event.getBookingId(), e);
            throw e; // triggers retry
        }
    }
}

