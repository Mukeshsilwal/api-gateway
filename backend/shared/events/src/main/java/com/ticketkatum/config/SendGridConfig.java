package com.ticketkatum.config;

import com.sendgrid.SendGrid;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SendGrid configuration for email service.
 */
@Slf4j
@Getter
@Configuration
public class SendGridConfig {

    @Value("${sendgrid.api.key:}")
    private String apiKey;

    @Value("${sendgrid.sender.email:noreply@ticketkatum.com}")
    private String senderEmail;

    @Value("${sendgrid.sender.name:Ticket Katum}")
    private String senderName;

    @Value("${sendgrid.enabled:true}")
    private boolean enabled;

    /**
     * Create SendGrid client bean.
     *
     * @return SendGrid client instance
     */
    @Bean
    public SendGrid sendGridClient() {
        if (!enabled) {
            log.warn("SendGrid is disabled. Email notifications will not be sent.");
            return null;
        }

        if (apiKey == null || apiKey.isEmpty() || "REPLACE_ME".equals(apiKey)) {
            log.error("SendGrid API key is not configured. Please set SENDGRID_API_KEY environment variable.");
            log.warn("Email service will be disabled until API key is configured.");
            return null;
        }

        log.info("Initializing SendGrid client with sender: {} <{}>", senderName, senderEmail);
        return new SendGrid(apiKey);
    }
}
