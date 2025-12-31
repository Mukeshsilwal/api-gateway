package com.ticketkatum.modules.travel.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Configuration
@ComponentScan(basePackages = "com.ticketkatum.modules.travel")
@EntityScan(basePackages = "com.ticketkatum.entity")
@EnableJpaRepositories(basePackages = "com.ticketkatum.repository")
public class TravelModuleConfiguration {
}
