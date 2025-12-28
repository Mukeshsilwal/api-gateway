package com.ticketkatum.event;

import com.ticketkatum.events.payment.PaymentVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "payment-verified";

    public void publishPaymentVerified(PaymentVerifiedEvent event) {
        kafkaTemplate.send(TOPIC, event.getBookingId(), event);
        log.info("Published payment verified event to Kafka topic '{}' for booking {}", TOPIC, event.getBookingId());
    }
}
