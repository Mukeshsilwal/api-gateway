package com.ticketkatum.service;

import com.ticketkatum.model.PaymentEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;


    public void publishPaymentSuccess(String bookingId, BigDecimal amount) {
        PaymentEvent event = new PaymentEvent();
        event.setEventType("PAYMENT_SUCCESS");
        event.setBookingId(bookingId);
        event.setProvider("ESEWA");
        event.setAmount(amount);

        kafkaTemplate.send("payment-events", bookingId, event);
    }
}
