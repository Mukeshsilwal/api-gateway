package com.ticketkatum.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.ticketkatum.config.SendGridConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * SendGrid implementation of EmailService.
 * Handles sending transactional emails using SendGrid API.
 */
@Slf4j
@Service
public class SendGridEmailService implements EmailService {

    @Autowired(required = false)
    private SendGrid sendGridClient;

    @Autowired
    private SendGridConfig config;

    @Override
    public boolean sendBookingConfirmation(
            String recipientEmail,
            String customerName,
            String confirmationNumber,
            String eventName,
            BigDecimal totalAmount,
            String ticketDownloadUrl) {
        try {
            String subject = "Booking Confirmed - " + eventName;
            String htmlContent = EmailTemplate.generateBookingConfirmation(
                    customerName,
                    confirmationNumber,
                    eventName,
                    totalAmount,
                    ticketDownloadUrl);

            return sendEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to {}", recipientEmail, e);
            return false;
        }
    }

    @Override
    public boolean sendHotelConfirmation(
            String recipientEmail,
            String customerName,
            String confirmationNumber,
            String hotelName,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            List<String> roomNumbers,
            String bookingVoucherUrl) {
        try {
            String subject = "Hotel Booking Confirmed - " + hotelName;
            String htmlContent = EmailTemplate.generateHotelConfirmation(
                    customerName,
                    confirmationNumber,
                    hotelName,
                    checkInDate,
                    checkOutDate,
                    roomNumbers,
                    bookingVoucherUrl);

            return sendEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send hotel confirmation email to {}", recipientEmail, e);
            return false;
        }
    }

    @Override
    public boolean sendBusTicket(
            String recipientEmail,
            String customerName,
            String ticketNumber,
            String busName,
            String route,
            Instant departureTime,
            List<String> seatNumbers,
            String boardingPoint,
            String ticketDownloadUrl) {
        try {
            String subject = "Bus Ticket Confirmed - " + route;
            String htmlContent = EmailTemplate.generateBusTicket(
                    customerName,
                    ticketNumber,
                    busName,
                    route,
                    departureTime,
                    seatNumbers,
                    boardingPoint,
                    ticketDownloadUrl);

            return sendEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send bus ticket email to {}", recipientEmail, e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentReceipt(
            String recipientEmail,
            String paymentId,
            BigDecimal amount,
            String currency,
            String receiptUrl) {
        try {
            String subject = "Payment Receipt - " + paymentId;
            String htmlContent = EmailTemplate.generatePaymentReceipt(
                    paymentId,
                    amount,
                    currency,
                    receiptUrl);

            return sendEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send payment receipt email to {}", recipientEmail, e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentFailure(
            String recipientEmail,
            String paymentId,
            String failureReason,
            boolean willRetry,
            Instant nextRetryAt) {
        try {
            String subject = "Payment Failed - " + paymentId;
            String htmlContent = EmailTemplate.generatePaymentFailure(
                    paymentId,
                    failureReason,
                    willRetry,
                    nextRetryAt);

            return sendEmail(recipientEmail, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send payment failure email to {}", recipientEmail, e);
            return false;
        }
    }

    /**
     * Core method to send email via SendGrid API.
     *
     * @param recipientEmail Recipient email address
     * @param subject        Email subject
     * @param htmlContent    HTML content of the email
     * @return true if email was sent successfully, false otherwise
     */
    private boolean sendEmail(String recipientEmail, String subject, String htmlContent) {
        if (sendGridClient == null) {
            log.warn("SendGrid client is not initialized. Email not sent to: {}", recipientEmail);
            return false;
        }

        if (!config.isEnabled()) {
            log.info("SendGrid is disabled. Skipping email to: {}", recipientEmail);
            return false;
        }

        try {
            Email from = new Email(config.getSenderEmail(), config.getSenderName());
            Email to = new Email(recipientEmail);
            Content content = new Content("text/html", htmlContent);
            Mail mail = new Mail(from, subject, to, content);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGridClient.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("✅ Email sent successfully to {} - Subject: {}", recipientEmail, subject);
                return true;
            } else {
                log.error("❌ SendGrid API error. Status: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("❌ Failed to send email to {} - Subject: {}", recipientEmail, subject, e);
            return false;
        }
    }
}
