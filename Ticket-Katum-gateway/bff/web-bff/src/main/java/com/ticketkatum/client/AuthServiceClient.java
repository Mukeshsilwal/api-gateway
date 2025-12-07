package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.UserDto;
import com.ticketkatum.dto.auth.ActiveSessionsResponse;
import com.ticketkatum.dto.auth.request.LoginRequest;
import com.ticketkatum.dto.auth.response.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Client for Authentication Service
 * Handles login, logout, session management, and user registration
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String SERVICE_NAME = "auth-service";
    private static final String CIRCUIT_BREAKER_NAME = "authService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getAuthServiceUrl())
                .build();
    }

    /**
     * Login user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "loginFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LoginResponse> login(LoginRequest loginRequest, String ipAddress, String userAgent) {
        log.debug("Authenticating user: {}", loginRequest.getUsername());

        return getWebClient()
                .post()
                .uri("/auth/login")
                .header("X-Forwarded-For", ipAddress)
                .header("User-Agent", userAgent)
                .bodyValue(loginRequest)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), LoginResponse.class))
                .toFuture()
                .exceptionally(ex -> {
                    log.error("Login failed for user: {}", loginRequest.getUsername(), ex);
                    throw new ServiceClientException("Authentication failed", ex);
                });
    }

    /**
     * Logout user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LogoutResponse> logout(String sessionId) {
        log.debug("Logging out session: {}", sessionId);

        return getWebClient()
                .post()
                .uri("/auth/logout")
                .header("Session-Id", sessionId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), LogoutResponse.class))
                .toFuture();
    }

    /**
     * Logout from all devices
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LogoutAllResponse> logoutAllDevices(String username) {
        log.debug("Logging out all sessions for user: {}", username);

        return getWebClient()
                .post()
                .uri("/auth/logout-all")
                .header("Username", username)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), LogoutAllResponse.class))
                .toFuture();
    }

    /**
     * Validate session
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "validateSessionFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<SessionValidationResponse> validateSession(String sessionId, String token) {
        log.debug("Validating session: {}", sessionId);

        return getWebClient()
                .get()
                .uri("/auth/session/validate")
                .header("Session-Id", sessionId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), SessionValidationResponse.class))
                .toFuture();
    }

    /**
     * Get active sessions for user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getActiveSessionsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<ActiveSessionsResponse> getActiveSessions(String username) {
        log.debug("Fetching active sessions for user: {}", username);

        return getWebClient()
                .get()
                .uri("/auth/sessions/active")
                .header("Username", username)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), ActiveSessionsResponse.class))
                .toFuture();
    }

    /**
     * Get online user count
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getOnlineUserCountFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Long> getOnlineUserCount() {
        log.debug("Fetching online user count");

        return getWebClient()
                .get()
                .uri("/auth/users/online/count")
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> {
                    Map<String, Object> data = (Map<String, Object>) response.getData();
                    return ((Number) data.get("activeUsers")).longValue();
                })
                .toFuture();
    }

    /**
     * Get all online users
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getOnlineUsersFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<String>> getOnlineUsers() {
        log.debug("Fetching online users");

        return getWebClient()
                .get()
                .uri("/auth/users/online")
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> {
                    Map<String, Object> data = (Map<String, Object>) response.getData();
                    return (List<String>) data.get("activeUsers");
                })
                .toFuture();
    }

    /**
     * Register new user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<UserDto> registerUser(UserDto userDto) {
        log.debug("Registering new user: {}", userDto.getUsername());

        return getWebClient()
                .post()
                .uri("/auth/register")
                .bodyValue(userDto)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), UserDto.class))
                .toFuture();
    }

    /**
     * Refresh token
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<RefreshTokenResponse> refreshToken(String refreshToken, String sessionId) {
        log.debug("Refreshing token for session: {}", sessionId);

        return getWebClient()
                .post()
                .uri("/auth/refresh")
                .header("Authorization", "Bearer " + refreshToken)
                .header("Session-Id", sessionId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), RefreshTokenResponse.class))
                .toFuture();
    }

    // ============ Fallback Methods ============

    private CompletableFuture<LoginResponse> loginFallback(
            LoginRequest loginRequest, String ipAddress, String userAgent, Throwable ex) {
        log.warn("Fallback: login for user: {}", loginRequest.getUsername());
        throw new ServiceClientException("Authentication service unavailable", ex);
    }

    private CompletableFuture<SessionValidationResponse> validateSessionFallback(
            String sessionId, String token, Throwable ex) {
        log.warn("Fallback: validateSession");
        return CompletableFuture.completedFuture(
                SessionValidationResponse.builder()
                        .valid(false)
                        .message("Session validation unavailable")
                        .build()
        );
    }

    private CompletableFuture<ActiveSessionsResponse> getActiveSessionsFallback(
            String username, Throwable ex) {
        log.warn("Fallback: getActiveSessions");
        return CompletableFuture.completedFuture(
                ActiveSessionsResponse.builder()
                        .username(username)
                        .sessions(Collections.emptyList())
                        .totalCount(0L)
                        .build()
        );
    }

    private CompletableFuture<Long> getOnlineUserCountFallback(Throwable ex) {
        log.warn("Fallback: getOnlineUserCount");
        return CompletableFuture.completedFuture(0L);
    }

    private CompletableFuture<List<String>> getOnlineUsersFallback(Throwable ex) {
        log.warn("Fallback: getOnlineUsers");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private <T> T objectMapper(Object data, Class<T> clazz) {
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(data, clazz);
    }
}