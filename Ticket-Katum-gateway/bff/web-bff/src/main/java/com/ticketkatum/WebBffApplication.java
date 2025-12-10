package com.ticketkatum;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@OpenAPIDefinition(
        info = @Info(
                title = "TicketKatum Web BFF API",
                version = "1.0.0",
                description = "Backend for Frontend service for Web clients providing aggregated APIs",
                contact = @Contact(
                        name = "TicketKatum Team",
                        email = "support@ticketkatum.com",
                        url = "https://ticketkatum.com"
                ),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0.html"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8081", description = "Local Development"),
                @Server(url = "http://localhost:8000/api/web", description = "Through Kong Gateway"),
                @Server(url = "https://api.ticketkatum.com/api/web", description = "Production")
        }
)
public class WebBffApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebBffApplication.class, args);
    }
}