package com.ticketkatum.guide;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
@EntityScan(basePackages = { "com.ticketkatum.common", "com.ticketkatum.guide" })
@EnableJpaRepositories(basePackages = { "com.ticketkatum.common", "com.ticketkatum.guide" })
public class GuideServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GuideServiceApplication.class, args);
    }

}
