package com.ticketkatum.jms;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.ticketkatum.entity.HotelBooking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@Slf4j
public class HotelEmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    private static final String FROM_EMAIL = "ticketkatum5@gmail.com";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /* -------------------------------------------------------------------------
     *  CORE SEND LOGIC (Shared by every email)
     * ------------------------------------------------------------------------- */
    private void sendSafely(Mail mail) {
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sg.api(request);

            String recipient = mail.getPersonalization().get(0).getTos().get(0).getEmail();
            log.info("📩 Hotel email sent successfully to {}", recipient);

        } catch (Exception ex) {
            log.error("❌ Hotel email sending failed: {}", ex.getMessage(), ex);
            // DO NOT rethrow — email failure should not break booking process
        }
    }

    /* -------------------------------------------------------------------------
     *  BASE EMAIL FACTORY
     * ------------------------------------------------------------------------- */
    private Mail buildHtmlMail(String to, String subject, String htmlBody) {
        Email from = new Email(FROM_EMAIL);
        Email recipient = new Email(to);
        Content content = new Content("text/html", htmlBody);

        return new Mail(from, subject, recipient, content);
    }

    /* -------------------------------------------------------------------------
     *  SEND SIMPLE HTML EMAIL
     * ------------------------------------------------------------------------- */
    public void sendHtml(String to, String subject, String htmlBody) {
        sendSafely(buildHtmlMail(to, subject, htmlBody));
    }

    /* -------------------------------------------------------------------------
     *  SEND EMAIL WITH PDF ATTACHMENT (Voucher/Invoice)
     * ------------------------------------------------------------------------- */
    public void sendEmailWithAttachment(String to, String subject, String htmlBody, byte[] pdfContent, String filename) {
        Mail mail = buildHtmlMail(to, subject, htmlBody);

        // Encode PDF
        Attachments attachment = new Attachments();
        attachment.setContent(Base64.getEncoder().encodeToString(pdfContent));
        attachment.setType("application/pdf");
        attachment.setFilename(filename);
        attachment.setDisposition("attachment");

        mail.addAttachments(attachment);

        sendSafely(mail);
    }

    /* -------------------------------------------------------------------------
     *  SEND HOTEL BOOKING CONFIRMATION EMAIL
     * ------------------------------------------------------------------------- */
    public void sendBookingConfirmation(HotelBooking booking) {
        String subject = "🏨 Hotel Booking Confirmation - " + booking.getConfirmationNumber();

        long numberOfNights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
                        .content { padding: 30px 20px; }
                        .success-badge { background: #10b981; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }
                        .booking-details { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { color: #6b7280; font-weight: 500; }
                        .detail-value { color: #111827; font-weight: 600; text-align: right; }
                        .hotel-info { background: linear-gradient(to right, #ede9fe, #ddd6fe); padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .hotel-name { font-size: 24px; font-weight: bold; color: #5b21b6; margin-bottom: 10px; }
                        .room-info { font-size: 16px; color: #6b21a8; }
                        .total-amount { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                        .total-label { font-size: 14px; color: #92400e; }
                        .total-value { font-size: 32px; font-weight: bold; color: #78350f; margin-top: 5px; }
                        .important-info { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .important-info h3 { margin: 0 0 10px; color: #991b1b; font-size: 16px; }
                        .important-info ul { margin: 0; padding-left: 20px; color: #7f1d1d; }
                        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
                        .footer p { margin: 5px 0; color: #6b7280; font-size: 14px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏨 Booking Confirmed!</h1>
                            <p>Your hotel reservation is confirmed and ready</p>
                        </div>
                        
                        <div class="content">
                            <div style="text-align: center;">
                                <span class="success-badge">✓ CONFIRMED</span>
                            </div>
                            
                            <div class="hotel-info">
                                <div class="hotel-name">%s</div>
                                <div class="room-info">%s Room × %d</div>
                            </div>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="detail-label">Confirmation Number</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-in Date</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-out Date</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Nights</span>
                                    <span class="detail-value">%d</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Number of Guests</span>
                                    <span class="detail-value">%d</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Booking Date</span>
                                    <span class="detail-value">%s</span>
                                </div>
                            </div>
                            
                            <div class="total-amount">
                                <div class="total-label">Total Amount Paid</div>
                                <div class="total-value">NPR %,.2f</div>
                            </div>
                            
                            <div class="important-info">
                                <h3>📋 Important Information</h3>
                                <ul>
                                    <li>Check-in time: 2:00 PM | Check-out time: 12:00 PM</li>
                                    <li>Please carry a valid ID proof during check-in</li>
                                    <li>Early check-in/late check-out subject to availability</li>
                                    <li>Cancellation allowed up to 24 hours before check-in</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center;">
                                <p style="color: #6b7280; margin: 20px 0;">
                                    Need help? Contact us at <strong>support@ticketkatum.com</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Thank you for choosing TicketKatum!</strong></p>
                            <p>© 2024 TicketKatum. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                booking.getHotelName(),
                booking.getRoomType(),
                booking.getNumberOfRooms(),
                booking.getConfirmationNumber(),
                booking.getBookingId(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCheckOutDate().format(DATE_FORMATTER),
                numberOfNights,
                booking.getNumberOfGuests(),
                booking.getBookingDateTime().format(DATETIME_FORMATTER),
                booking.getTotalAmount()
        );

        sendSafely(buildHtmlMail(booking.getContactEmail(), subject, html));
    }

    /* -------------------------------------------------------------------------
     *  SEND HOTEL CANCELLATION EMAIL
     * ------------------------------------------------------------------------- */
    public void sendCancellationEmail(HotelBooking booking, BigDecimal cancellationCharge, BigDecimal refundAmount) {
        String subject = "Hotel Booking Cancelled - " + booking.getConfirmationNumber();

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { padding: 30px 20px; }
                        .cancel-badge { background: #ef4444; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }
                        .booking-details { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { color: #6b7280; font-weight: 500; }
                        .detail-value { color: #111827; font-weight: 600; }
                        .refund-info { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .refund-title { color: #065f46; font-weight: bold; font-size: 18px; margin-bottom: 15px; }
                        .refund-row { display: flex; justify-content: space-between; padding: 8px 0; }
                        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Cancelled</h1>
                            <p>Your hotel reservation has been cancelled</p>
                        </div>
                        
                        <div class="content">
                            <div style="text-align: center;">
                                <span class="cancel-badge">✕ CANCELLED</span>
                            </div>
                            
                            <p style="color: #374151; line-height: 1.6;">
                                Your booking at <strong>%s</strong> has been successfully cancelled.
                            </p>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="detail-label">Confirmation Number</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Hotel Name</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Room Type</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Check-in Date</span>
                                    <span class="detail-value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Cancellation Date</span>
                                    <span class="detail-value">%s</span>
                                </div>
                            </div>
                            
                            <div class="refund-info">
                                <div class="refund-title">💰 Refund Details</div>
                                <div class="refund-row">
                                    <span>Original Amount:</span>
                                    <span><strong>NPR %,.2f</strong></span>
                                </div>
                                <div class="refund-row">
                                    <span>Cancellation Charge:</span>
                                    <span style="color: #dc2626;"><strong>- NPR %,.2f</strong></span>
                                </div>
                                <div class="refund-row" style="border-top: 2px solid #10b981; padding-top: 12px; margin-top: 8px;">
                                    <span style="font-size: 18px;"><strong>Refund Amount:</strong></span>
                                    <span style="color: #059669; font-size: 20px;"><strong>NPR %,.2f</strong></span>
                                </div>
                                <p style="margin-top: 15px; color: #065f46; font-size: 14px;">
                                    ℹ️ The refund will be processed within 7-10 business days to your original payment method.
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #6b7280;">
                                    Questions? Contact us at <strong>support@ticketkatum.com</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 TicketKatum. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                booking.getHotelName(),
                booking.getConfirmationNumber(),
                booking.getHotelName(),
                booking.getRoomType(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getCancellationDateTime().format(DATETIME_FORMATTER),
                booking.getTotalAmount(),
                cancellationCharge,
                refundAmount
        );

        sendSafely(buildHtmlMail(booking.getContactEmail(), subject, html));
    }

    /* -------------------------------------------------------------------------
     *  SEND REFUND CONFIRMATION EMAIL
     * ------------------------------------------------------------------------- */
    public void sendRefundConfirmation(HotelBooking booking) {
        String subject = "✅ Refund Processed - " + booking.getConfirmationNumber();

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { padding: 30px 20px; }
                        .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
                        .refund-box { background: #ecfdf5; border: 2px solid #10b981; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
                        .refund-amount { font-size: 36px; font-weight: bold; color: #059669; margin: 15px 0; }
                        .booking-details { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Refund Processed Successfully</h1>
                        </div>
                        
                        <div class="content">
                            <div class="success-icon">✅</div>
                            
                            <div class="refund-box">
                                <p style="margin: 0; color: #065f46; font-size: 18px;">Your refund amount</p>
                                <div class="refund-amount">NPR %,.2f</div>
                                <p style="margin: 10px 0 0; color: #047857;">has been initiated and will be credited within 7-10 business days</p>
                            </div>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span>Confirmation Number:</span>
                                    <span><strong>%s</strong></span>
                                </div>
                                <div class="detail-row">
                                    <span>Hotel Name:</span>
                                    <span><strong>%s</strong></span>
                                </div>
                                <div class="detail-row">
                                    <span>Refund Date:</span>
                                    <span><strong>%s</strong></span>
                                </div>
                            </div>
                            
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>📌 Note:</strong> The refund will be credited to your original payment method. 
                                    If you have any questions, please contact our support team.
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Thank you for using TicketKatum!</strong></p>
                            <p>© 2024 TicketKatum. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                booking.getRefundAmount(),
                booking.getConfirmationNumber(),
                booking.getHotelName(),
                booking.getRefundDateTime().format(DATETIME_FORMATTER)
        );

        sendSafely(buildHtmlMail(booking.getContactEmail(), subject, html));
    }

    /* -------------------------------------------------------------------------
     *  SEND BOOKING REMINDER (1 day before check-in)
     * ------------------------------------------------------------------------- */
    public void sendCheckInReminder(HotelBooking booking) {
        String subject = "⏰ Check-in Reminder - Tomorrow at " + booking.getHotelName();

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; padding: 30px; }
                        .reminder-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
                        .hotel-name { font-size: 24px; font-weight: bold; color: #5b21b6; text-align: center; }
                        .check-in-time { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                        .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="reminder-icon">🏨</div>
                        <h2 style="text-align: center; color: #333;">Your Check-in is Tomorrow!</h2>
                        
                        <div class="hotel-name">%s</div>
                        
                        <div class="check-in-time">
                            <p style="margin: 0; font-size: 14px; color: #92400e;">Check-in Date</p>
                            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #78350f;">%s</p>
                        </div>
                        
                        <div class="details">
                            <p><strong>Confirmation Number:</strong> %s</p>
                            <p><strong>Room Type:</strong> %s × %d</p>
                            <p><strong>Check-in Time:</strong> 2:00 PM onwards</p>
                        </div>
                        
                        <p style="color: #6b7280; text-align: center;">
                            Don't forget to bring a valid ID proof!
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(
                booking.getHotelName(),
                booking.getCheckInDate().format(DATE_FORMATTER),
                booking.getConfirmationNumber(),
                booking.getRoomType(),
                booking.getNumberOfRooms()
        );

        sendSafely(buildHtmlMail(booking.getContactEmail(), subject, html));
    }

    /* -------------------------------------------------------------------------
     *  SEND BOOKING WITH VOUCHER ATTACHMENT
     * ------------------------------------------------------------------------- */
    public void sendBookingWithVoucher(HotelBooking booking, byte[] voucherPdf) {
        String subject = "🏨 Hotel Booking Voucher - " + booking.getConfirmationNumber();

        String html = """
                <div style='font-family: Arial; padding: 20px;'>
                    <h2>Your Hotel Booking Voucher</h2>
                    <p>Please find your booking voucher attached.</p>
                    <p><strong>Confirmation Number:</strong> %s</p>
                    <p>Present this voucher during check-in.</p>
                    <br>
                    <p>Thank you for booking with TicketKatum!</p>
                </div>
                """.formatted(booking.getConfirmationNumber());

        sendEmailWithAttachment(
                booking.getContactEmail(),
                subject,
                html,
                voucherPdf,
                "hotel-voucher-" + booking.getConfirmationNumber() + ".pdf"
        );
    }
}