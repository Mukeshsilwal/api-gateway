package com.ticketkatum.configs;

import com.ticketkatum.security.JwtAuthenticationEntryPoint;
import com.ticketkatum.security.JwtAuthenticationFilter;
import com.ticketkatum.security.OAuth2AuthenticationFailureHandler;
import com.ticketkatum.security.OAuth2AuthenticationSuccessHandler;
import com.ticketkatum.security.SessionValidationFilter;
import com.ticketkatum.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security Configuration
 * Configures authentication, authorization, and security filters including
 * OAuth2
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfiguration {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final SessionValidationFilter sessionValidationFilter;

        // OAuth2 dependencies
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
        private final OAuth2AuthenticationFailureHandler oAuth2FailureHandler;

        // Inject UserDetailsService - Spring will use the @Service annotated
        // CustomUserDetailsService
        private final UserDetailsService userDetailsService;

        /**
         * Configure security filter chain
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) // Disable for stateless API
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // OAuth2 endpoints - must be public
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                                                // Public endpoints
                                                .requestMatchers("/api/bff/v1/auth/register/admin").permitAll()
                                                .requestMatchers("/api/bff/v1/auth/register/send-otp").permitAll()
                                                .requestMatchers("/api/bff/v1/auth/register/verify-otp").permitAll()
                                                .requestMatchers("/api/bff/v1/auth/register/change-password")
                                                .permitAll()

                                                // Actuator endpoints (secure in production)
                                                .requestMatchers("/actuator/health").permitAll()
                                                .requestMatchers("/actuator/**").hasRole("ADMIN")
                                                .requestMatchers(
                                                                "/auth/**",
                                                                "/register/**",
                                                                "/bookSeats/confirm",
                                                                "/bookSeats/cancel",
                                                                "/corn/**",
                                                                "/secret/**",
                                                                "/payment/**",
                                                                "/tickets/**",
                                                                "/busStop/**",
                                                                "/route/**",
                                                                "/bus/**",
                                                                "/seat/**",
                                                                "/booking/**",
                                                                "/api/booking/**",
                                                                "/api/qfx/**",
                                                                "/mock/qfx/api/**",
                                                                "/api/v1/payment/**",
                                                                "/api/v1/find/**",
                                                                "/api/v1/hotels/**",
                                                                "/actuator/health",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/error",
                                                                "/api/users/**",
                                                                "/api/roles",
                                                                "/api/registration/**")
                                                .permitAll()

                                                // API documentation
                                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                                                // All other requests require authentication
                                                .anyRequest().authenticated())

                                // OAuth2 Login Configuration
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler)
                                                .failureHandler(oAuth2FailureHandler))

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(401);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setStatus(403);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Access denied\"}");
                                                }))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(sessionValidationFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        /**
         * Configure CORS settings
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:4200",
                                "http://localhost:5173",
                                "http://localhost:8081",
                                "https://yourdomain.com"));

                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With",
                                "Session-Id",
                                "Username"));

                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Disposition",
                                "Session-Id"));

                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

        /**
         * Configure authentication provider
         * IMPORTANT: userDetailsService is injected, not created as bean
         */
        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                authProvider.setHideUserNotFoundExceptions(false);
                log.info("DaoAuthenticationProvider configured with CustomUserDetailsService");
                return authProvider;
        }

        /**
         * Configure password encoder
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
        }

        /**
         * Expose authentication manager bean
         */
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
                        throws Exception {
                return config.getAuthenticationManager();
        }
}