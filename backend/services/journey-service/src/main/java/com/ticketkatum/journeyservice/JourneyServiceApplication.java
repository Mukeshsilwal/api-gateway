package com.ticketkatum.journeyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableKafka
@EnableAsync
@EnableScheduling
@EntityScan(basePackages = { "com.ticketkatum.common", "com.ticketkatum.journeyservice" })
@EnableJpaRepositories(basePackages = { "com.ticketkatum.common", "com.ticketkatum.journeyservice" })
public class JourneyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(JourneyServiceApplication.class, args);
    }
}
