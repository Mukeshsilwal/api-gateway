package com.ticketkatum.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Server Application
 * 
 * Service Discovery and Registration Server for Ticket Katum Microservices.
 * Provides service registry, health monitoring, and load balancing support.
 * 
 * @author Ticket Katum Team
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
