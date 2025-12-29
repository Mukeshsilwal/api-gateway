package com.ticketkatum.common.image.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dsqubrfjp");
        config.put("api_key", "624365773875321");
        config.put("api_secret", "9P5wS1lelWdo6CubuJxzQiNTClw");
        return new Cloudinary(config);
    }
}
