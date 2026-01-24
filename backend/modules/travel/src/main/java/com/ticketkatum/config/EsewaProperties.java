package com.ticketkatum.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component("travelEsewaProperties")
@ConfigurationProperties(prefix = "esewa")
public class EsewaProperties {

    private String merchantCode;
    private String successUrl;
    private String failureUrl;
    private String baseUrl;
}
