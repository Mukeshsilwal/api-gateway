package com.ticketkatum.jms;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Base64;

@Service
@Slf4j
public class TravelEmailService {

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
            log.error("Email sending failed: {}", ex.getMessage(), ex);
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
}
