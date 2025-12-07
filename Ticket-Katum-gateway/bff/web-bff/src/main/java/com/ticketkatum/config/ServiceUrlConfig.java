package com.ticketkatum.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for microservice URLs
 * Maps from application.yml
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "microservices")
public class ServiceUrlConfig {

    private String hotelServiceUrl;
    private String recommendationServiceUrl;
    private String paymentServiceUrl;
    private String maintenanceServiceUrl;
    private String staffServiceUrl;
    private String imageServiceUrl;
    private String authServiceUrl;
    private String userServiceUrl;
    private String bookingServiceUrl;

    // Timeouts
    private TimeoutConfig timeout = new TimeoutConfig();

    @Data
    public static class TimeoutConfig {
        private int connectionTimeout = 5000;
        private int responseTimeout = 10000;
        private int readTimeout = 10000;
    }
}

