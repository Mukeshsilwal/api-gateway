package com.ticketkatum.configs.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.esewa")
public class EsewaConfig {
    private String baseUrl;
    private String verifyUrl;
    private String merchantCode;
    private String secretKey;
    private boolean enabledSandbox = true;
    private int timeout = 30000; // 30 seconds
    private double maxAmount = 100000.0; // NPR 1 lakh
    private double serviceChargePercent = 2.0;
}
