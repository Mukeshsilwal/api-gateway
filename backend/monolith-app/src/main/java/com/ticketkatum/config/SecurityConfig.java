package com.ticketkatum.config;

import com.ticketkatum.security.JwtAuthenticationFilter;
import com.ticketkatum.security.OAuth2FailureHandler;
import com.ticketkatum.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.http.HttpStatus;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final OAuth2SuccessHandler oauth2SuccessHandler;
        private final OAuth2FailureHandler oauth2FailureHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ASYNC)
                                                .permitAll()
                                                // Public endpoints - ORDER MATTERS!
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers("/api/bff/v1/auth/**").permitAll()
                                                // OAuth2 endpoints - must be public
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                                                // Allow gateway public paths to forward to BFF (rewritten by
                                                // ApiPathRewriteFilter)
                                                .requestMatchers("/api/web/v1/auth/**").permitAll()
                                                .requestMatchers(
                                                                "/actuator/**",
                                                                "/health/**",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html",
                                                                "/api/bff/v1/home",
                                                                "/api/bff/v1/buses/**",
                                                                "/api/bff/v1/hotels/**",
                                                                "/api/bff/v1/registration/**",
                                                                "/api/bff/market/**",
                                                                "/api/bff/v1/ai/**",
                                                                "/api/bff/v1/events/**",
                                                                "/api/bff/v1/payments/verify/**") // Payment
                                                                                                  // verification
                                                                                                  // callbacks (eSewa,
                                                                                                  // Khalti)
                                                // access
                                                .permitAll()

                                                // Public API endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/hotels/search/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/hotels/{id}").permitAll()

                                                // Authentication required
                                                .requestMatchers("/api/bookings/**").authenticated()
                                                .requestMatchers("/api/payments/**").authenticated()
                                                .requestMatchers("/api/user/**").authenticated()

                                                // Admin endpoints - require authentication
                                                .requestMatchers("/api/bff/v1/admin/**").authenticated()
                                                .requestMatchers("/api/bff/v1/users/**").authenticated() // User
                                                // management -
                                                // admin only
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // All other requests require authentication
                                                .anyRequest().authenticated())
                                // OAuth2 Login Configuration
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oauth2SuccessHandler)
                                                .failureHandler(oauth2FailureHandler))
                                // Add custom JWT filter
                                .addFilterBefore(jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                // Configure security context to be inherited by async threads
                org.springframework.security.core.context.SecurityContextHolder
                                .setStrategyName(
                                                org.springframework.security.core.context.SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "https://ticketkatum.com",
                                "https://www.ticketkatum.com"));

                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "X-Request-ID",
                                "X-Correlation-ID",
                                "Session-Id",
                                "Username",
                                "User-Id",
                                "X-User-Id"));

                configuration.setExposedHeaders(Arrays.asList(
                                "X-Request-ID",
                                "X-Correlation-ID"));

                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}