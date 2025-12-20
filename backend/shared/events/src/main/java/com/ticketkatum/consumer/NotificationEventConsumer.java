package com.ticketkatum.consumer;

import com.ticketkatum.events.booking.BookingConfirmedEvent;
import com.ticketkatum.events.hotel.HotelBookingConfirmedEvent;
import com.ticketkatum.events.bus.BusBookingConfirmedEvent;
import com.ticketkatum.events.payment.PaymentCapturedEvent;
import com.ticketkatum.events.payment.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Example notification event consumer.
 * Sends email/SMS notifications based on events.
 * 
 * Usage: Add this to notification-service or any service handling notifications.
 * Requires: shared-events dependency, email service (e.g., SendGrid), SMS service (e.g., Twilio)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    // Inject your notification services here
    // private final EmailService emailService;
    // private final SmsService smsService;

    /**
     * Send booking confirmation email when booking is confirmed.
     */
    @KafkaListener(
        topics = "events.booking.confirmed.v1",
        groupId = "${spring.application.name}-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleBookingConfirmed(
            @Payload BookingConfirmedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (BookingConfirmedEvent.BookingConfirmedPayload) event.getPayload();
            
            log.info("Sending booking confirmation to customer: {}", payload.getCustomerEmail());
            
            // Send confirmation email
            /*
            emailService.sendBookingConfirmation(
                payload.getCustomerEmail(),
                payload.getCustomerName(),
                payload.getConfirmationNumber(),
                payload.getEventName(),
                payload.getTotalAmount(),
                payload.getTicketDownloadUrl()
            );
            */
            
            // Send SMS notification
            /*
            if (payload.getCustomerPhone() != null) {
                smsService.sendBookingConfirmation(
                    payload.getCustomerPhone(),
                    payload.getConfirmationNumber()
                );
            }
            */
            
            log.info("Booking confirmation sent successfully: {}", payload.getConfirmationNumber());
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error sending booking confirmation", e);
            // Don't acknowledge - will retry
        }
    }

    /**
     * Send hotel booking confirmation.
     */
    @KafkaListener(
        topics = "events.hotel.booking.confirmed.v1",
        groupId = "${spring.application.name}-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleHotelBookingConfirmed(
            @Payload HotelBookingConfirmedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (HotelBookingConfirmedEvent.HotelBookingConfirmedPayload) event.getPayload();
            
            log.info("Sending hotel booking confirmation to: {}", payload.getCustomerEmail());
            
            // Send hotel confirmation email
            /*
            emailService.sendHotelConfirmation(
                payload.getCustomerEmail(),
                payload.getCustomerName(),
                payload.getConfirmationNumber(),
                payload.getHotelName(),
                payload.getCheckInDate(),
                payload.getCheckOutDate(),
                payload.getRoomNumbers(),
                payload.getBookingVoucherUrl()
            );
            */
            
            log.info("Hotel confirmation sent: {}", payload.getConfirmationNumber());
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error sending hotel confirmation", e);
        }
    }

    /**
     * Send bus booking confirmation.
     */
    @KafkaListener(
        topics = "events.bus.booking.confirmed.v1",
        groupId = "${spring.application.name}-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleBusBookingConfirmed(
            @Payload BusBookingConfirmedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (BusBookingConfirmedEvent.BusBookingConfirmedPayload) event.getPayload();
            
            log.info("Sending bus ticket to: {}", payload.getCustomerEmail());
            
            // Send bus ticket email
            /*
            emailService.sendBusTicket(
                payload.getCustomerEmail(),
                payload.getCustomerName(),
                payload.getTicketNumber(),
                payload.getBusName(),
                payload.getRoute(),
                payload.getDepartureTime(),
                payload.getSeatNumbers(),
                payload.getBoardingPoint(),
                payload.getTicketDownloadUrl()
            );
            */
            
            // Send SMS with ticket details
            /*
            if (payload.getCustomerPhone() != null) {
                smsService.sendBusTicket(
                    payload.getCustomerPhone(),
                    payload.getTicketNumber(),
                    payload.getBoardingPoint(),
                    payload.getDepartureTime()
                );
            }
            */
            
            log.info("Bus ticket sent: {}", payload.getTicketNumber());
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error sending bus ticket", e);
        }
    }

    /**
     * Send payment receipt when payment is captured.
     */
    @KafkaListener(
        topics = "events.payment.captured.v1",
        groupId = "${spring.application.name}-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentCaptured(
            @Payload PaymentCapturedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (PaymentCapturedEvent.PaymentCapturedPayload) event.getPayload();
            
            log.info("Sending payment receipt for: {}", payload.getPaymentId());
            
            // Send payment receipt email
            /*
            emailService.sendPaymentReceipt(
                payload.getCustomerEmail(),
                payload.getPaymentId(),
                payload.getCapturedAmount(),
                payload.getCurrency(),
                payload.getReceiptUrl()
            );
            */
            
            log.info("Payment receipt sent: {}", payload.getPaymentId());
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error sending payment receipt", e);
        }
    }

    /**
     * Send payment failure notification.
     */
    @KafkaListener(
        topics = "events.payment.failed.v1",
        groupId = "${spring.application.name}-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handlePaymentFailed(
            @Payload PaymentFailedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            var payload = (PaymentFailedEvent.PaymentFailedPayload) event.getPayload();
            
            log.warn("Sending payment failure notification for: {}", payload.getPaymentId());
            
            // Send payment failure email
            /*
            emailService.sendPaymentFailure(
                payload.getCustomerEmail(),
                payload.getPaymentId(),
                payload.getFailureReason(),
                payload.getWillRetry(),
                payload.getNextRetryAt()
            );
            */
            
            log.info("Payment failure notification sent: {}", payload.getPaymentId());
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error sending payment failure notification", e);
        }
    }
}
