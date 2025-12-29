package com.ticketkatum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class TravelServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelServiceApplication.class, args);
    }
}