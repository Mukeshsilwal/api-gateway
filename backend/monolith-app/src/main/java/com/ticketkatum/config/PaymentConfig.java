package com.ticketkatum.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.callback")
public class PaymentConfig {
    private String successUrl = "http://localhost:3000/payment/verify/esewa";
    private String failureUrl = "http://localhost:3000/payment/failure";
}
