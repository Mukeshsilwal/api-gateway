package com.ticketkatum.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for microservice URLs
 * Maps from application.yml
 * Supports both Hotel and Bus microservices
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "microservices")
public class ServiceUrlConfig {

    // ============ Hotel Management Services ============
    private String hotelServiceUrl;
    private String recommendationServiceUrl;
    private String paymentServiceUrl;
    private String maintenanceServiceUrl;
    private String staffServiceUrl;
    private String imageServiceUrl;
    private String registrationServiceUrl;
    private String bookingServiceUrl;

    // ============ Authentication & User Services ============
    private String authServiceUrl;
    private String userServiceUrl;


    // ============ Bus Ticketing Services ============
    private String busServiceUrl;
    private String busStopServiceUrl;
    private String routeServiceUrl;
    private String seatServiceUrl;
    private String ticketServiceUrl;
    private String busBookingServiceUrl;

    // ============ Common Services ============
    private String notificationServiceUrl;
    private String emailServiceUrl;
    private String smsServiceUrl;

    // Timeouts
    private TimeoutConfig timeout = new TimeoutConfig();

    @Data
    public static class TimeoutConfig {
        private int connectionTimeout = 5000;
        private int responseTimeout = 10000;
        private int readTimeout = 10000;
    }

    // ============ Validation ============
    public void validateUrls() {
        if (hotelServiceUrl == null || hotelServiceUrl.isEmpty()) {
            throw new IllegalStateException("Hotel service URL is not configured");
        }
        if (authServiceUrl == null || authServiceUrl.isEmpty()) {
            throw new IllegalStateException("Auth service URL is not configured");
        }
        if (busServiceUrl == null || busServiceUrl.isEmpty()) {
            throw new IllegalStateException("Bus service URL is not configured");
        }
    }
}
