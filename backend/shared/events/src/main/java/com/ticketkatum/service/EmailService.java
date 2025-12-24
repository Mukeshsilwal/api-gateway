package com.ticketkatum.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Email service interface for sending transactional emails.
 * Implementations should handle email template generation, sending, and error
 * handling.
 */
public interface EmailService {

    /**
     * Send booking confirmation email for event tickets.
     *
     * @param recipientEmail     Customer email address
     * @param customerName       Customer name
     * @param confirmationNumber Booking confirmation number
     * @param eventName          Name of the event
     * @param totalAmount        Total booking amount
     * @param ticketDownloadUrl  URL to download tickets
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendBookingConfirmation(
            String recipientEmail,
            String customerName,
            String confirmationNumber,
            String eventName,
            BigDecimal totalAmount,
            String ticketDownloadUrl);

    /**
     * Send hotel booking confirmation email.
     *
     * @param recipientEmail     Customer email address
     * @param customerName       Customer name
     * @param confirmationNumber Booking confirmation number
     * @param hotelName          Name of the hotel
     * @param checkInDate        Check-in date
     * @param checkOutDate       Check-out date
     * @param roomNumbers        List of room numbers
     * @param bookingVoucherUrl  URL to download booking voucher
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendHotelConfirmation(
            String recipientEmail,
            String customerName,
            String confirmationNumber,
            String hotelName,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            List<String> roomNumbers,
            String bookingVoucherUrl);

    /**
     * Send bus ticket confirmation email.
     *
     * @param recipientEmail    Customer email address
     * @param customerName      Customer name
     * @param ticketNumber      Ticket number
     * @param busName           Name of the bus
     * @param route             Bus route
     * @param departureTime     Departure time
     * @param seatNumbers       List of seat numbers
     * @param boardingPoint     Boarding point location
     * @param ticketDownloadUrl URL to download ticket
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendBusTicket(
            String recipientEmail,
            String customerName,
            String ticketNumber,
            String busName,
            String route,
            Instant departureTime,
            List<String> seatNumbers,
            String boardingPoint,
            String ticketDownloadUrl);

    /**
     * Send payment receipt email.
     *
     * @param recipientEmail Customer email address
     * @param paymentId      Payment ID
     * @param amount         Payment amount
     * @param currency       Currency code
     * @param receiptUrl     URL to download receipt
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendPaymentReceipt(
            String recipientEmail,
            String paymentId,
            BigDecimal amount,
            String currency,
            String receiptUrl);

    /**
     * Send payment failure notification email.
     *
     * @param recipientEmail Customer email address
     * @param paymentId      Payment ID
     * @param failureReason  Reason for payment failure
     * @param willRetry      Whether the payment will be retried
     * @param nextRetryAt    Next retry timestamp (if applicable)
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendPaymentFailure(
            String recipientEmail,
            String paymentId,
            String failureReason,
            boolean willRetry,
            Instant nextRetryAt);
}
