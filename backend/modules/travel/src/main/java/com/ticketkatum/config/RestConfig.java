package com.ticketkatum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestConfig {

    @Bean
    @org.springframework.context.annotation.Primary
    public RestTemplate travelRestTemplate() {
        return new RestTemplate();
    }
}
