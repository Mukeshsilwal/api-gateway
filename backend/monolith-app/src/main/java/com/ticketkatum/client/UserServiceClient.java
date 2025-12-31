package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.auth.UserDto;
import com.ticketkatum.dto.RestResponsePage;
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
    public CompletableFuture<RestResponsePage<UserDto>> getAllUsers(int page, int size, String role) {
        log.debug("Fetching all users page: {}, size: {}", page, size);

        return getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/users")
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .queryParam("role", role)
                        .build())
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<RestResponsePage<UserDto>>() {
                })
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "user-service")
    public CompletableFuture<UserDto> updateUser(Integer userId,
            com.ticketkatum.dto.request.UpdateUserRequest request) {
        log.debug("Updating user: {}", userId);

        return getWebClient()
                .put()
                .uri("/api/users/{id}", userId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(UserDto.class)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "user-service")
    public CompletableFuture<UserDto> createUser(com.ticketkatum.dto.request.CreateUserRequest request) {
        log.debug("Creating user: {}", request.getEmail());

        return getWebClient()
                .post()
                .uri("/api/users")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(
                        new org.springframework.core.ParameterizedTypeReference<com.ticketkatum.dto.Response<UserDto>>() {
                        })
                .map(response -> response.getData())
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = "user-service")
    public CompletableFuture<Void> deleteUser(Integer userId) {
        log.debug("Deleting user: {}", userId);

        return getWebClient()
                .delete()
                .uri("/api/users/{id}", userId)
                .retrieve()
                .bodyToMono(Void.class)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRolesFallback")
    @Retry(name = "user-service")
    public CompletableFuture<List<com.ticketkatum.dto.auth.RoleDto>> getRoles() {
        log.debug("Fetching all roles");

        return getWebClient()
                .get()
                .uri("/api/roles")
                .retrieve()
                .bodyToMono(
                        new org.springframework.core.ParameterizedTypeReference<List<com.ticketkatum.dto.auth.RoleDto>>() {
                        })
                .toFuture();
    }

    // Fallback methods
    private CompletableFuture<UserDto> getUserByIdFallback(Integer userId, Throwable ex) {
        log.warn("Fallback: getUserById for ID: {}", userId);
        return CompletableFuture.completedFuture(
                UserDto.builder()
                        .email("User information unavailable")
                        .build());
    }

    private CompletableFuture<RestResponsePage<UserDto>> getAllUsersFallback(int page, int size, String role,
            Throwable ex) {
        log.warn("Fallback: getAllUsers");
        return CompletableFuture.completedFuture(new RestResponsePage<>());
    }

    private CompletableFuture<List<com.ticketkatum.dto.auth.RoleDto>> getRolesFallback(Throwable ex) {
        log.warn("Fallback: getRoles");
        return CompletableFuture.completedFuture(java.util.Collections.emptyList());
    }
}
