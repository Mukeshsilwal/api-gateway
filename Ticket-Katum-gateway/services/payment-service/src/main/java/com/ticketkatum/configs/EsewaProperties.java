package com.ticketkatum.configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "esewa")
public class EsewaProperties {

    private String merchantCode;
    private String successUrl;
    private String failureUrl;
    private String baseUrl;
    private String verifyUrl;   // Add this for verification endpoint
    private String secretKey;
}
