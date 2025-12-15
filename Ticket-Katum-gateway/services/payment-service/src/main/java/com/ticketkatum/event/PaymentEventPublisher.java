package com.ticketkatum.event;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final JmsTemplate jmsTemplate;

    public void publishPaymentVerified(PaymentVerifiedEvent event) {
        jmsTemplate.convertAndSend("payment.verified", event);
        log.info("Published payment.verified event for booking {}", event.getBookingId());
    }
}

