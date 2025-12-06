package com.ticketkatum.configs.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.khalti")
public class KhaltiConfig {
    private String baseUrl;
    private String verifyUrl;
    private String publicKey;
    private String secretKey;
    private boolean enabledSandbox = true;
    private int timeout = 30000;
    private double maxAmount = 100000.0;
}
