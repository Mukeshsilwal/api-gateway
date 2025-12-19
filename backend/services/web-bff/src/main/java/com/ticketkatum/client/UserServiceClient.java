package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.auth.UserDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Client for User Service
 * Handles user profile management
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String CIRCUIT_BREAKER_NAME = "userService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getUserServiceUrl())
                .build();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getUserByIdFallback")
    @Retry(name = "user-service")
    public CompletableFuture<UserDto> getUserById(Integer userId) {
        log.debug("Fetching user by ID: {}", userId);

        return getWebClient()
                .get()
                .uri("/api/users/{id}", userId)
                .retrieve()
                .bodyToMono(UserDto.class)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getAllUsersFallback")
    @Retry(name = "user-service")
    public CompletableFuture<List<UserDto>> getAllUsers() {
        log.debug("Fetching all users");

        return getWebClient()
                .get()
                .uri("/user/")
                .retrieve()
                .bodyToFlux(UserDto.class)
                .collectList()
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "user-service")
    public CompletableFuture<UserDto> updateUser(Integer userId, UserDto userDto) {
        log.debug("Updating user: {}", userId);

        return getWebClient()
                .put()
                .uri("/user/{id}", userId)
                .bodyValue(userDto)
                .retrieve()
                .bodyToMono(UserDto.class)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "user-service")
    public CompletableFuture<UserDto> createUser(UserDto userDto) {
        log.debug("Creating user: {}", userDto.getEmail());

        return getWebClient()
                .post()
                .uri("/user/")
                .bodyValue(userDto)
                .retrieve()
                .bodyToMono(UserDto.class)
                .toFuture();
    }

    // Fallback methods
    private CompletableFuture<UserDto> getUserByIdFallback(Integer userId, Throwable ex) {
        log.warn("Fallback: getUserById for ID: {}", userId);
        return CompletableFuture.completedFuture(
                UserDto.builder()
                        .email("User information unavailable")
                        .build()
        );
    }

    private CompletableFuture<List<UserDto>> getAllUsersFallback(Throwable ex) {
        log.warn("Fallback: getAllUsers");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }
}
