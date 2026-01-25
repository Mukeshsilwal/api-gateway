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
@org.springframework.context.annotation.ComponentScan(
    basePackages = "com.ticketkatum",
    excludeFilters = {
        @org.springframework.context.annotation.ComponentScan.Filter(
            type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
            classes = {
                com.ticketkatum.common.service.SystemConfigService.class,
                com.ticketkatum.SharedApplication.class,
                com.ticketkatum.modules.travel.config.TravelModuleConfiguration.class
            }
        ),
        // Exclude module-specific SecurityConfig classes to prevent conflicts
        @org.springframework.context.annotation.ComponentScan.Filter(
            type = org.springframework.context.annotation.FilterType.REGEX,
            pattern = {
                "com\\.ticketkatum\\.tripservice\\.config\\.SecurityConfig",
                "com\\.ticketkatum\\.trackingservice\\.config\\.SecurityConfig"
            }
        )
    }
)
@EnableCaching
@EnableAsync
@EnableScheduling
@org.springframework.cloud.openfeign.EnableFeignClients(basePackages = "com.ticketkatum")
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = "com.ticketkatum")
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = "com.ticketkatum")
@org.springframework.data.jpa.repository.config.EnableJpaAuditing
@org.springframework.kafka.annotation.EnableKafka
@OpenAPIDefinition(info = @Info(title = "TicketKatum Modular Monolith API", version = "1.0.0", description = "Unified Backend Service", contact = @Contact(name = "TicketKatum Team", email = "support@ticketkatum.com", url = "https://ticketkatum.com"), license = @License(name = "Apache 2.0", url = "https://www.apache.org/licenses/LICENSE-2.0.html")), servers = {
                @Server(url = "http://localhost:8080", description = "Local Monolith")
})
public class MonolithApplication {

        public static void main(String[] args) {
                SpringApplication.run(MonolithApplication.class, args);
        }
}