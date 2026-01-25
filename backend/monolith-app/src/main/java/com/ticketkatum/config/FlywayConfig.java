package com.ticketkatum.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

/**
 * Modular Flyway Configuration
 * Each module gets its own Flyway migration instance and schema history table.
 * This prevents version collisions between modules (e.g., multiple V1__init.sql files).
 */
@Configuration
public class FlywayConfig {

    private Flyway createFlyway(DataSource dataSource, String moduleName) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/" + moduleName)
                .table("flyway_schema_" + moduleName.toLowerCase())
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .outOfOrder(true)
                .validateOnMigrate(false) 
                .load();
        
        // Ensure migrations are applied on startup
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway authFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "auth");
    }

    @Bean
    public Flyway paymentFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "payment");
    }

    @Bean
    public Flyway travelFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "travel");
    }

    @Bean
    public Flyway platformFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "platform");
    }

    @Bean
    public Flyway safetyFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "safety");
    }

    @Bean
    public Flyway tripFlyway(DataSource dataSource) {
        return createFlyway(dataSource, "trip");
    }
}
