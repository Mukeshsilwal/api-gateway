package com.ticketkatum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration for Event Service (Standalone Mode Only)
 * DISABLED in monolith - using centralized SecurityConfig instead
 * Temporarily allows all requests for testing
 */
// @Configuration  // Disabled for monolith - causes bean conflict
// @EnableWebSecurity  // Disabled for monolith - using centralized security
public class SecurityConfig {

    // @Bean  // Disabled for monolith
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Allow all requests for testing
                );
        return http.build();
    }
}
