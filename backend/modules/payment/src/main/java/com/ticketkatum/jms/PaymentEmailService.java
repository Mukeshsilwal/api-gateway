package com.ticketkatum.jms;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.ticketkatum.entity.PaymentTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
@Slf4j
public class PaymentEmailService {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    private static final String FROM_EMAIL = "ticketkatum5@gmail.com";

    /* =========================================================================
     *  GENERIC SEND METHOD (SendGrid)
     * ========================================================================= */
    private void sendSafely(Mail mail) {
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            sg.api(request);

            String recipient = mail.getPersonalization().get(0).getTos().get(0).getEmail();
            log.info("📩 Email sent successfully to {}", recipient);

        } catch (Exception ex) {
            log.error("❌ Email sending failed: {}", ex.getMessage(), ex);
        }
    }

    /* =========================================================================
     *  MAIL FACTORY
     * ========================================================================= */
    private Mail buildHtmlMail(String to, String subject, String htmlBody) {
        Email from = new Email(FROM_EMAIL);
        Email recipient = new Email(to);
        Content content = new Content("text/html", htmlBody);

        return new Mail(from, subject, recipient, content);
    }

    /* =========================================================================
     *  SIMPLE HTML EMAIL
     * ========================================================================= */
    public void sendHtml(String to, String subject, String htmlBody) {
        sendSafely(buildHtmlMail(to, subject, htmlBody));
    }

    /* =========================================================================
     *  EMAIL + PDF ATTACHMENT
     * ========================================================================= */
    public void sendEmailWithAttachment(String to, String subject, String htmlBody, byte[] pdfContent) {

        Mail mail = buildHtmlMail(to, subject, htmlBody);

        Attachments attachment = new Attachments();
        attachment.setContent(Base64.getEncoder().encodeToString(pdfContent));
        attachment.setType("application/pdf");
        attachment.setFilename("ticket.pdf");
        attachment.setDisposition("attachment");

        mail.addAttachments(attachment);

        sendSafely(mail);
    }

    /* =========================================================================
     *  CANCEL TICKET EMAIL
     * ========================================================================= */
    public void sendEmailForCancelTicket(String to, String subject, String body) {
        sendSafely(buildHtmlMail(to, subject, body));
    }

    /* =========================================================================
     *  OTP EMAIL
     * ========================================================================= */
    public void sendEmailForOtp(String to, String subject, String body) {
        sendSafely(buildHtmlMail(to, subject, body));
    }

    /* =========================================================================
     *  SEND ADMIN CREDENTIALS
     * ========================================================================= */
    public void sendCredentials(String email, String userName, String password) {

        String subject = "Your Admin Login Credentials";

        String html = String.format("""
                <div style='font-family: Arial; padding: 20px; background:#f8f9fa'>
                    <div style='background:#fff; padding:20px; border-radius:10px;'>
                        <h2 style='color:#333;'>Admin Registration Approved</h2>
                        <p>Your credentials are below:</p>

                        <table style='border-collapse: collapse; width:100%%; margin-top:10px;'>
                            <tr>
                                <td style='padding:10px; border:1px solid #ddd'><strong>Username</strong></td>
                                <td style='padding:10px; border:1px solid #ddd'>%s</td>
                            </tr>
                            <tr>
                                <td style='padding:10px; border:1px solid #ddd'><strong>Password</strong></td>
                                <td style='padding:10px; border:1px solid #ddd'>%s</td>
                            </tr>
                        </table>

                        <p style='margin-top:20px;'>Please change your password after logging in.</p>
                    </div>
                </div>
                """, userName, password);

        sendHtml(email, subject, html);
    }

    /* =========================================================================
     *  PAYMENT EMAILS (SUCCESS / FAILURE / PENDING)
     *  → Merged from NotificationService
     * ========================================================================= */

    @Async
    public void sendPaymentSuccessNotification(PaymentTransaction txn) {
        sendSafely(buildHtmlMail(
                getUserEmail(txn.getUserId()),
                "Payment Successful - " + txn.getInternalTxnId(),
                buildSuccessEmailBody(txn)
        ));
    }

    @Async
    public void sendPaymentFailureNotification(PaymentTransaction txn) {
        sendSafely(buildHtmlMail(
                getUserEmail(txn.getUserId()),
                "Payment Failed - " + txn.getInternalTxnId(),
                buildFailureEmailBody(txn)
        ));
    }

    @Async
    public void sendPaymentPendingNotification(PaymentTransaction txn) {
        sendSafely(buildHtmlMail(
                getUserEmail(txn.getUserId()),
                "Payment Pending - " + txn.getInternalTxnId(),
                buildPendingEmailBody(txn)
        ));
    }

    /* =========================================================================
     *  PAYMENT EMAIL TEMPLATES
     * ========================================================================= */

    private String buildSuccessEmailBody(PaymentTransaction txn) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return String.format("""
            Dear Customer,<br><br>

            Your payment has been processed <b>successfully</b>! 🎉<br><br>

            <b>Transaction Details:</b><br>
            Transaction ID: %s<br>
            Amount: NPR %s<br>
            Payment Method: %s<br>
            Date: %s<br>
            Description: %s<br><br>

            Thank you for using TicketKatum.
            """,
                txn.getInternalTxnId(),
                txn.getAmount(),
                txn.getProvider(),
                txn.getCompletedAt() != null ? txn.getCompletedAt().format(formatter) : "N/A",
                txn.getDescription() != null ? txn.getDescription() : "N/A"
        );
    }

    private String buildFailureEmailBody(PaymentTransaction txn) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return String.format("""
            Dear Customer,<br><br>

            Unfortunately, your payment <b>failed</b> ❌<br><br>

            <b>Transaction Details:</b><br>
            Transaction ID: %s<br>
            Amount: NPR %s<br>
            Payment Method: %s<br>
            Date: %s<br>
            Reason: %s<br><br>

            Please try again or contact support.
            """,
                txn.getInternalTxnId(),
                txn.getAmount(),
                txn.getProvider(),
                txn.getUpdatedAt().format(formatter),
                txn.getFailureReason() != null ? txn.getFailureReason() : "Unknown error"
        );
    }

    private String buildPendingEmailBody(PaymentTransaction txn) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return String.format("""
            Dear Customer,<br><br>

            Your payment is currently <b>pending</b> ⏳<br><br>

            <b>Transaction Details:</b><br>
            Transaction ID: %s<br>
            Amount: NPR %s<br>
            Payment Method: %s<br>
            Date: %s<br><br>

            You will be notified once payment is confirmed.
            """,
                txn.getInternalTxnId(),
                txn.getAmount(),
                txn.getProvider(),
                txn.getCreatedAt().format(formatter)
        );
    }

    /* =========================================================================
     *  GET USER EMAIL (replace with actual DB lookup)
     * ========================================================================= */
    private String getUserEmail(String userId) {
        // TODO: Replace with real implementation
        return "user@example.com";
    }
}
