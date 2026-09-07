package com.ticketkatum.config;

import com.ticketkatum.security.JwtAuthenticationFilter;
import com.ticketkatum.security.OAuth2FailureHandler;
import com.ticketkatum.security.OAuth2SuccessHandler;
import com.ticketkatum.security.SessionValidationFilter;
import com.ticketkatum.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final SessionValidationFilter sessionValidationFilter;
        private final OAuth2SuccessHandler oauth2SuccessHandler;
        private final OAuth2FailureHandler oauth2FailureHandler;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final UserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // Enhanced HTTP Security Headers
                                .headers(headers -> {
                                                headers.frameOptions(frameOptions -> frameOptions.deny());
                                                headers.xssProtection(xss -> xss.headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK));
                                                headers.contentTypeOptions(org.springframework.security.config.Customizer.withDefaults());
                                                headers.referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                                                headers.permissionsPolicy(permissions -> permissions.policy("camera=(), microphone=(), geolocation=(self)"));
                                                headers.httpStrictTransportSecurity(hsts -> hsts
                                                                .includeSubDomains(true)
                                                                .maxAgeInSeconds(31536000));
                                })
                                // Standardized JSON Error Handling (prevents information leakage)
                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        log.warn("Unauthorized request to {}: {}", request.getRequestURI(), authException.getMessage());
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.setCharacterEncoding("UTF-8");
                                                        response.getWriter().write(String.format(
                                                                "{\"timestamp\":\"%s\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\",\"path\":\"%s\"}",
                                                                java.time.Instant.now().toString(),
                                                                request.getRequestURI()
                                                        ));
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        log.warn("Access denied for request to {}: {}", request.getRequestURI(), accessDeniedException.getMessage());
                                                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        response.setContentType("application/json");
                                                        response.setCharacterEncoding("UTF-8");
                                                        response.getWriter().write(String.format(
                                                                "{\"timestamp\":\"%s\",\"status\":403,\"error\":\"Forbidden\",\"message\":\"Access denied\",\"path\":\"%s\"}",
                                                                java.time.Instant.now().toString(),
                                                                request.getRequestURI()
                                                        ));
                                                })
                                )
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ASYNC)
                                                .permitAll()
                                                // Public endpoints - ORDER MATTERS!
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers("/api/bff/v1/auth/**").permitAll()
                                                .requestMatchers("/auth/**").permitAll()
                                                .requestMatchers("/register/**").permitAll()
                                                // OAuth2 endpoints - must be public
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                                                // Allow gateway public paths to forward to BFF (rewritten by ApiPathRewriteFilter)
                                                .requestMatchers("/api/web/v1/auth/**").permitAll()
                                                .requestMatchers(
                                                                "/actuator/health", // Allow health check explicitly
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html",
                                                                "/api/bff/v1/home",
                                                                "/api/bff/v1/home-data",
                                                                "/api/bff/v1/buses/**",
                                                                "/api/bff/v1/hotels",
                                                                "/api/bff/v1/hotels/**",
                                                                "/api/bff/v1/registration/**",
                                                                "/api/bff/v1/market/**",
                                                                "/api/bff/v1/ai/**",
                                                                "/api/bff/v1/events/**",
                                                                "/api/bff/v1/payments/verify/**",
                                                                "/api/bff/v1/payments/initiate/**",
                                                                "/api/bff/v1/guides/**",
                                                                "/api/guides/**",
                                                                "/busStop/**",
                                                                "/bus/**",
                                                                "/seat/**",
                                                                "/admin/**",
                                                                "/bookSeats/**",
                                                                "/api/route/**",
                                                                "/api/v1/buses/**",
                                                                "/api/v1/hotels",
                                                                "/api/v1/hotels/**",
                                                                "/api/v1/bookings/**",
                                                                "/api/v1/payment/**",
                                                                "/api/bff/v1/hotels/bookings/**",
                                                                "/api/bff/v1/bookings/**",
                                                                "/api/bff/v1/find/**",
                                                                "/api/find/**",
                                                                "/api/v1/find/**",
                                                                "/hotel/**",
                                                                "/booking/**",
                                                                "/tickets/**")
                                                .permitAll()

                                                // Public API endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/hotels/search/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/hotels/{id}").permitAll()

                                                // Actuator endpoints (secure in production, except health)
                                                .requestMatchers("/actuator/**").hasRole("ADMIN")

                                                // Authentication required
                                                .requestMatchers("/api/bookings/**").authenticated()
                                                .requestMatchers("/api/payments/**").authenticated()
                                                .requestMatchers("/api/user/**").authenticated()

                                                // Admin endpoints - require ADMIN role
                                                .requestMatchers("/api/bff/v1/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/bff/v1/users/**").hasRole("ADMIN")
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // All other requests require authentication
                                                .anyRequest().authenticated())
                                
                                // OAuth2 Login Configuration
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oauth2SuccessHandler)
                                                .failureHandler(oauth2FailureHandler))
                                
                                .authenticationProvider(authenticationProvider())
                                
                                // Filters
                                .addFilterBefore(sessionValidationFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                // Configure security context to be inherited by async threads
                org.springframework.security.core.context.SecurityContextHolder
                                .setStrategyName(
                                                org.springframework.security.core.context.SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "http://localhost:5173",
                                "http://localhost:4200",
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
                                "X-User-Id",
                                "Origin",
                                "X-Requested-With"));

                configuration.setExposedHeaders(Arrays.asList(
                                "X-Request-ID",
                                "X-Correlation-ID",
                                "Authorization",
                                "Session-Id",
                                "Content-Disposition"));

                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                authProvider.setHideUserNotFoundExceptions(false);
                return authProvider;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}