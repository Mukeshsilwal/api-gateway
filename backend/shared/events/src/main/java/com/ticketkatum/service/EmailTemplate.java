package com.ticketkatum.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Utility class for generating HTML email templates.
 */
public class EmailTemplate {

    private static final String BASE_STYLE = """
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                    .info-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #495057; }
                    .value { color: #212529; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
                    .button:hover { background: #5568d3; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                    .success { color: #28a745; font-weight: 600; }
                    .warning { color: #ffc107; font-weight: 600; }
                    .error { color: #dc3545; font-weight: 600; }
                </style>
            """;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter
            .ofPattern("MMM dd, yyyy 'at' hh:mm a");

    /**
     * Generate booking confirmation email HTML.
     */
    public static String generateBookingConfirmation(
            String customerName,
            String confirmationNumber,
            String eventName,
            BigDecimal totalAmount,
            String ticketDownloadUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Booking Confirmed!</h1>
                        </div>
                        <div class="content">
                            <p>Dear %s,</p>
                            <p>Great news! Your booking has been confirmed. We're excited to see you at the event!</p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Confirmation Number:</span>
                                    <span class="value"><strong>%s</strong></span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Event:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Total Amount:</span>
                                    <span class="value">NPR %s</span>
                                </div>
                            </div>

                            %s

                            <p><strong>Important:</strong> Please bring a valid ID and this confirmation email to the event.</p>

                            <p>If you have any questions, feel free to contact our support team.</p>

                            <p>See you at the event!</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Ticket Katum. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        BASE_STYLE,
                        customerName,
                        confirmationNumber,
                        eventName,
                        totalAmount,
                        ticketDownloadUrl != null
                                ? "<a href=\"" + ticketDownloadUrl + "\" class=\"button\">Download Your Tickets</a>"
                                : "<p class=\"warning\">Your tickets will be available shortly.</p>");
    }

    /**
     * Generate hotel booking confirmation email HTML.
     */
    public static String generateHotelConfirmation(
            String customerName,
            String confirmationNumber,
            String hotelName,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            List<String> roomNumbers,
            String bookingVoucherUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏨 Hotel Booking Confirmed!</h1>
                        </div>
                        <div class="content">
                            <p>Dear %s,</p>
                            <p>Your hotel reservation has been confirmed. We hope you enjoy your stay!</p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Confirmation Number:</span>
                                    <span class="value"><strong>%s</strong></span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Hotel:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Check-in:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Check-out:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Room(s):</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>

                            %s

                            <p><strong>Check-in Time:</strong> 2:00 PM | <strong>Check-out Time:</strong> 12:00 PM</p>
                            <p><strong>Important:</strong> Please bring a valid ID and this confirmation email at check-in.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Ticket Katum. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        BASE_STYLE,
                        customerName,
                        confirmationNumber,
                        hotelName,
                        checkInDate.format(DATE_FORMATTER),
                        checkOutDate.format(DATE_FORMATTER),
                        String.join(", ", roomNumbers),
                        bookingVoucherUrl != null
                                ? "<a href=\"" + bookingVoucherUrl + "\" class=\"button\">Download Booking Voucher</a>"
                                : "");
    }

    /**
     * Generate bus ticket confirmation email HTML.
     */
    public static String generateBusTicket(
            String customerName,
            String ticketNumber,
            String busName,
            String route,
            Instant departureTime,
            List<String> seatNumbers,
            String boardingPoint,
            String ticketDownloadUrl) {
        String formattedDeparture = DATETIME_FORMATTER.format(
                departureTime.atZone(ZoneId.systemDefault()));

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚌 Bus Ticket Confirmed!</h1>
                        </div>
                        <div class="content">
                            <p>Dear %s,</p>
                            <p>Your bus ticket has been confirmed. Have a safe journey!</p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Ticket Number:</span>
                                    <span class="value"><strong>%s</strong></span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Bus:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Route:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Departure:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Seat(s):</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Boarding Point:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>

                            %s

                            <p><strong>Important:</strong> Please arrive at the boarding point at least 15 minutes before departure.</p>
                            <p>Bring a valid ID and this confirmation email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Ticket Katum. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        BASE_STYLE,
                        customerName,
                        ticketNumber,
                        busName,
                        route,
                        formattedDeparture,
                        String.join(", ", seatNumbers),
                        boardingPoint,
                        ticketDownloadUrl != null
                                ? "<a href=\"" + ticketDownloadUrl + "\" class=\"button\">Download Your Ticket</a>"
                                : "");
    }

    /**
     * Generate payment receipt email HTML.
     */
    public static String generatePaymentReceipt(
            String paymentId,
            BigDecimal amount,
            String currency,
            String receiptUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>💳 Payment Receipt</h1>
                        </div>
                        <div class="content">
                            <p class="success">✓ Payment Successful</p>
                            <p>Thank you for your payment. Your transaction has been processed successfully.</p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Payment ID:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Amount:</span>
                                    <span class="value"><strong>%s %s</strong></span>
                                </div>
                            </div>

                            %s

                            <p>If you have any questions about this payment, please contact our support team with the payment ID.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Ticket Katum. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        BASE_STYLE,
                        paymentId,
                        amount,
                        currency,
                        receiptUrl != null ? "<a href=\"" + receiptUrl + "\" class=\"button\">Download Receipt</a>"
                                : "");
    }

    /**
     * Generate payment failure notification email HTML.
     */
    public static String generatePaymentFailure(
            String paymentId,
            String failureReason,
            boolean willRetry,
            Instant nextRetryAt) {
        String retryInfo = willRetry && nextRetryAt != null
                ? "<p class=\"warning\">We will automatically retry this payment on " +
                        DATETIME_FORMATTER.format(nextRetryAt.atZone(ZoneId.systemDefault())) + "</p>"
                : "<p>Please try again or contact support if the issue persists.</p>";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Payment Failed</h1>
                        </div>
                        <div class="content">
                            <p class="error">✗ Payment Unsuccessful</p>
                            <p>We were unable to process your payment. Please review the details below.</p>

                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Payment ID:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Reason:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>

                            %s

                            <p><strong>What to do next:</strong></p>
                            <ul>
                                <li>Check your payment method details</li>
                                <li>Ensure sufficient funds are available</li>
                                <li>Contact your bank if the issue persists</li>
                                <li>Reach out to our support team for assistance</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Ticket Katum. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                BASE_STYLE,
                paymentId,
                failureReason,
                retryInfo);
    }
}
