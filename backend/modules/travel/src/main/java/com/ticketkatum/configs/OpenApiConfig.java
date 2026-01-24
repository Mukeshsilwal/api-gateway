package com.ticketkatum.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for bus-service (Standalone Mode Only)
 * DISABLED in monolith - using centralized Swagger config
 * Access Swagger UI at: http://localhost:8083/swagger-ui.html
 */
// @Configuration
public class OpenApiConfig {

    // @Bean
    public OpenAPI busServiceOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8083");
        localServer.setDescription("Local Development Server");

        Contact contact = new Contact();
        contact.setName("TicketKatum Support");
        contact.setEmail("support@ticketkatum.com");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Bus Service API")
                .version("1.0.0")
                .description("RESTful API for managing buses, routes, seats, and bookings")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}
