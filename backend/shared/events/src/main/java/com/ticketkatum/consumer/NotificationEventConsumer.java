package com.ticketkatum.consumer;

import com.ticketkatum.events.booking.BookingConfirmedEvent;
import com.ticketkatum.events.hotel.HotelBookingConfirmedEvent;
import com.ticketkatum.events.bus.BusBookingConfirmedEvent;
import com.ticketkatum.events.payment.PaymentCapturedEvent;
import com.ticketkatum.events.payment.PaymentFailedEvent;
import com.ticketkatum.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Notification event consumer.
 * Processes events and sends email notifications via SendGrid.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final EmailService emailService;

    /**
     * Handle booking confirmation events.
     * Logs notification details and can be extended to send actual emails/SMS.
     */
    @KafkaListener(topics = "events.booking.confirmed.v1", groupId = "${spring.application.name:notification-service}-notifications", containerFactory = "kafkaListenerContainerFactory")
    public void handleBookingConfirmed(
            @Payload BookingConfirmedEvent event,
            Acknowledgment acknowledgment) {

        try {
            var payload = (BookingConfirmedEvent.BookingConfirmedPayload) event.getPayload();

            log.info("📧 NOTIFICATION: Booking Confirmation");
            log.info("   → Customer: {} ({})", payload.getCustomerName(), payload.getCustomerEmail());
            log.info("   → Confirmation #: {}", payload.getConfirmationNumber());
            log.info("   → Event: {}", payload.getEventName());
            log.info("   → Amount: NPR {}", payload.getTotalAmount());
            if (payload.getTicketDownloadUrl() != null) {
                log.info("   → Ticket URL: {}", payload.getTicketDownloadUrl());
            }

            // Send email notification
            try {
                boolean emailSent = emailService.sendBookingConfirmation(
                        payload.getCustomerEmail(),
                        payload.getCustomerName(),
                        payload.getConfirmationNumber(),
                        payload.getEventName(),
                        payload.getTotalAmount(),
                        payload.getTicketDownloadUrl());
                if (emailSent) {
                    log.info("📧 Email sent to: {}", payload.getCustomerEmail());
                } else {
                    log.warn("⚠️ Email sending failed for: {}", payload.getCustomerEmail());
                }
            } catch (Exception emailEx) {
                log.error("❌ Error sending email to: {}", payload.getCustomerEmail(), emailEx);
                // Don't fail the entire event processing due to email failure
            }

            log.info("✅ Booking notification processed: {}", payload.getConfirmationNumber());
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("❌ Error processing booking confirmation notification", e);
            // Don't acknowledge - Kafka will retry
        }
    }

    /**
     * Handle hotel booking confirmation events.
     */
    @KafkaListener(topics = "events.hotel.booking.confirmed.v1", groupId = "${spring.application.name:notification-service}-notifications", containerFactory = "kafkaListenerContainerFactory")
    public void handleHotelBookingConfirmed(
            @Payload HotelBookingConfirmedEvent event,
            Acknowledgment acknowledgment) {

        try {
            var payload = (HotelBookingConfirmedEvent.HotelBookingPayload) event.getPayload();

            log.info("📧 NOTIFICATION: Hotel Booking Confirmation");
            log.info("   → Customer: {}", payload.getCustomerEmail());
            log.info("   → Confirmation #: {}", payload.getConfirmationNumber());
            log.info("   → Hotel: {}", payload.getHotelName());
            log.info("   → Check-in: {} | Check-out: {}", payload.getCheckInDate(), payload.getCheckOutDate());
            log.info("   → Room Type: {}", payload.getRoomType());

            // Send email notification
            try {
                // Note: HotelBookingPayload doesn't have all fields needed for full email
                // Using available fields and providing defaults for missing ones
                boolean emailSent = emailService.sendHotelConfirmation(
                        payload.getCustomerEmail(),
                        payload.getCustomerEmail(), // Using email as name since customerName not available
                        payload.getConfirmationNumber(),
                        payload.getHotelName(),
                        payload.getCheckInDate(),
                        payload.getCheckOutDate(),
                        java.util.Collections.singletonList(payload.getRoomType()), // Using room type as room number
                        null // Voucher URL not available in payload
                );
                if (emailSent) {
                    log.info("📧 Email sent to: {}", payload.getCustomerEmail());
                } else {
                    log.warn("⚠️ Email sending failed for: {}", payload.getCustomerEmail());
                }
            } catch (Exception emailEx) {
                log.error("❌ Error sending email to: {}", payload.getCustomerEmail(), emailEx);
                // Don't fail the entire event processing due to email failure
            }

            log.info("✅ Hotel notification processed: {}", payload.getConfirmationNumber());
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("❌ Error processing hotel confirmation notification", e);
        }
    }

    /**
     * Handle bus booking confirmation events.
     */
    @KafkaListener(topics = "events.bus.booking.confirmed.v1", groupId = "${spring.application.name:notification-service}-notifications", containerFactory = "kafkaListenerContainerFactory")
    public void handleBusBookingConfirmed(
            @Payload BusBookingConfirmedEvent event,
            Acknowledgment acknowledgment) {

        try {
            var payload = (BusBookingConfirmedEvent.BusBookingConfirmedPayload) event.getPayload();

            log.info("📧 NOTIFICATION: Bus Ticket Confirmation");
            log.info("   → Customer: {} ({})", payload.getCustomerName(), payload.getCustomerEmail());
            log.info("   → Ticket #: {}", payload.getTicketNumber());
            log.info("   → Bus: {} | Route: {}", payload.getBusName(), payload.getRoute());
            log.info("   → Departure: {}", payload.getDepartureTime());
            log.info("   → Seats: {}", payload.getSeatNumbers());
            log.info("   → Boarding Point: {}", payload.getBoardingPoint());
            if (payload.getTicketDownloadUrl() != null) {
                log.info("   → Ticket URL: {}", payload.getTicketDownloadUrl());
            }

            // Send email notification
            try {
                // Convert LocalDateTime to Instant for email service
                Instant departureInstant = payload.getDepartureTime() != null
                        ? payload.getDepartureTime().atZone(java.time.ZoneId.systemDefault()).toInstant()
                        : null;

                // Convert comma-separated seat numbers to List
                List<String> seatNumbersList = payload.getSeatNumbers() != null
                        ? java.util.Arrays.asList(payload.getSeatNumbers().split(",\\s*"))
                        : java.util.Collections.emptyList();

                boolean emailSent = emailService.sendBusTicket(
                        payload.getCustomerEmail(),
                        payload.getCustomerName(),
                        payload.getTicketNumber(),
                        payload.getBusName(),
                        payload.getRoute(),
                        departureInstant,
                        seatNumbersList,
                        payload.getBoardingPoint(),
                        payload.getTicketDownloadUrl());
                if (emailSent) {
                    log.info("📧 Email sent to: {}", payload.getCustomerEmail());
                } else {
                    log.warn("⚠️ Email sending failed for: {}", payload.getCustomerEmail());
                }
            } catch (Exception emailEx) {
                log.error("❌ Error sending email to: {}", payload.getCustomerEmail(), emailEx);
                // Don't fail the entire event processing due to email failure
            }

            // TODO: Uncomment when SmsService is implemented
            /*
             * if (payload.getCustomerPhone() != null) {
             * smsService.sendBusTicket(
             * payload.getCustomerPhone(),
             * payload.getTicketNumber(),
             * payload.getBoardingPoint(),
             * payload.getDepartureTime()
             * );
             * }
             */

            log.info("✅ Bus ticket notification processed: {}", payload.getTicketNumber());
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("❌ Error processing bus ticket notification", e);
        }
    }

    /**
     * Handle payment captured events.
     */
    @KafkaListener(topics = "events.payment.captured.v1", groupId = "${spring.application.name:notification-service}-notifications", containerFactory = "kafkaListenerContainerFactory")
    public void handlePaymentCaptured(
            @Payload PaymentCapturedEvent event,
            Acknowledgment acknowledgment) {

        try {
            var payload = (PaymentCapturedEvent.PaymentCapturedPayload) event.getPayload();

            log.info("📧 NOTIFICATION: Payment Receipt");
            log.info("   → Payment ID: {}", payload.getPaymentId());
            log.info("   → Amount: {} {}", payload.getCapturedAmount(), payload.getCurrency());
            if (payload.getReceiptUrl() != null) {
                log.info("   → Receipt URL: {}", payload.getReceiptUrl());
            }

            // Send email notification
            // Note: We need customer email from the payload
            // For now, logging that payment receipt would be sent
            // TODO: Update PaymentCapturedEvent to include customer email
            log.info("💳 Payment receipt ready for payment ID: {}", payload.getPaymentId());
            // emailService.sendPaymentReceipt(
            // customerEmail, // Need to add this to event payload
            // payload.getPaymentId(),
            // payload.getCapturedAmount(),
            // payload.getCurrency(),
            // payload.getReceiptUrl()
            // );

            log.info("✅ Payment receipt notification processed: {}", payload.getPaymentId());
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("❌ Error processing payment receipt notification", e);
        }
    }

    /**
     * Handle payment failure events.
     */
    @KafkaListener(topics = "events.payment.failed.v1", groupId = "${spring.application.name:notification-service}-notifications", containerFactory = "kafkaListenerContainerFactory")
    public void handlePaymentFailed(
            @Payload PaymentFailedEvent event,
            Acknowledgment acknowledgment) {

        try {
            var payload = (PaymentFailedEvent.PaymentFailedPayload) event.getPayload();

            log.warn("📧 NOTIFICATION: Payment Failure Alert");
            log.warn("   → Payment ID: {}", payload.getPaymentId());
            log.warn("   → Reason: {}", payload.getFailureReason());
            log.warn("   → Will Retry: {}", payload.getWillRetry());
            if (payload.getNextRetryAt() != null) {
                log.warn("   → Next Retry: {}", payload.getNextRetryAt());
            }

            // Send email notification
            // Note: We need customer email from the payload
            // For now, logging that payment failure notification would be sent
            // TODO: Update PaymentFailedEvent to include customer email
            log.warn("⚠️ Payment failure notification ready for payment ID: {}", payload.getPaymentId());
            // emailService.sendPaymentFailure(
            // customerEmail, // Need to add this to event payload
            // payload.getPaymentId(),
            // payload.getFailureReason(),
            // payload.getWillRetry(),
            // payload.getNextRetryAt()
            // );

            log.info("✅ Payment failure notification processed: {}", payload.getPaymentId());
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("❌ Error processing payment failure notification", e);
        }
    }
}
