package com.ticketkatum.configs;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.imepay")
public class IMEPayConfig {
    private String baseUrl;
    private String verifyUrl;
    private String merchantCode;
    private String merchantName;
    private String secretKey;
    private String module;
    private boolean enabledSandbox = true;
    private int timeout = 30000;
    private double maxAmount = 200000.0; // NPR 2 lakh
}