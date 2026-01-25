package com.ticketkatum.client;

import com.ticketkatum.dto.auth.ActiveSessionsResponse;
import com.ticketkatum.dto.auth.CreateUserRequest;
import com.ticketkatum.dto.auth.UserDto;
import com.ticketkatum.dto.auth.request.CreateRegistrationRequest;
import com.ticketkatum.dto.auth.request.LoginRequest;
import com.ticketkatum.dto.auth.response.*;
import com.ticketkatum.model.JwtRequest;
import com.ticketkatum.modules.auth.api.AuthServiceApi;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Client for Authentication Service
 * Refactored to use direct method calls to Auth Module
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    @org.springframework.context.annotation.Lazy
    private final AuthServiceApi authService;

    private static final String SERVICE_NAME = "auth-service";
    private static final String CIRCUIT_BREAKER_NAME = "authService";

    /**
     * Login user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "loginFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LoginResponse> login(LoginRequest loginRequest, String ipAddress, String userAgent) {
        log.debug("Authenticating user: {}", loginRequest.getUsername());

        return Mono.fromCallable(() -> {
            JwtRequest jwtRequest = new JwtRequest();
            jwtRequest.setUsername(loginRequest.getUsername());
            jwtRequest.setPassword(loginRequest.getPassword());
            
            com.ticketkatum.model.LoginResponse response = authService.login(jwtRequest, ipAddress, userAgent);
            
            // Map model to DTO
            return LoginResponse.builder()
                    .accessToken(response.getAccessToken())
                    .refreshToken(response.getRefreshToken())
                    .sessionId(response.getSessionId())
                    .username(response.getUsername())
                    .roles(response.getRoles())
                    .activeSessionCount(response.getActiveSessionCount())
                    .tokenType(response.getTokenType())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Logout user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LogoutResponse> logout(String sessionId) {
        log.debug("Logging out session: {}", sessionId);

        return Mono.fromCallable(() -> {
            com.ticketkatum.model.LogoutResponse response = authService.logout(sessionId);
            return LogoutResponse.builder()
                    .sessionId(response.getSessionId())
                    .message(response.getMessage())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Logout from all devices
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<LogoutAllResponse> logoutAllDevices(String username) {
        log.debug("Logging out all sessions for user: {}", username);

        return Mono.fromCallable(() -> {
            Map<String, Object> response = authService.logoutAllDevices(username);
            return LogoutAllResponse.builder()
                    .username((String) response.get("username"))
                    .sessionsInvalidated((Long) response.get("sessionsInvalidated"))
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Validate session
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "validateSessionFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<SessionValidationResponse> validateSession(String sessionId, String token) {
        log.debug("Validating session: {}", sessionId);

        return Mono.fromCallable(() -> {
            com.ticketkatum.model.SessionValidationResponse response = authService.validateSession(sessionId, token);
            return SessionValidationResponse.builder()
                    .valid(response.isValid())
                    .sessionId(response.getSessionId())
                    .username(response.getUsername())
                    .roles(response.getRoles())
                    .ipAddress(response.getIpAddress())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Get active sessions for user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getActiveSessionsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<ActiveSessionsResponse> getActiveSessions(String username) {
        log.debug("Fetching active sessions for user: {}", username);

        return Mono.fromCallable(() -> {
            com.ticketkatum.model.ActiveSessionsResponse response = authService.getActiveSessions(username);
            // Handling List<Map> is still tricky if DTO expects List<Map>.
            // Assuming DTO matches Model here aside from package.
            return ActiveSessionsResponse.builder()
                    .username(response.getUsername())
                    .sessions(response.getSessions()) 
                    .totalCount(response.getTotalCount())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Get online user count
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getOnlineUserCountFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Long> getOnlineUserCount() {
        return Mono.fromCallable(authService::getOnlineUserCount)
                .subscribeOn(Schedulers.boundedElastic())
                .toFuture();
    }

    /**
     * Get all online users
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getOnlineUsersFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<String>> getOnlineUsers() {
        return Mono.fromCallable(authService::getOnlineUsers)
                .subscribeOn(Schedulers.boundedElastic())
                .toFuture();
    }

    /**
     * Register new user
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<UserDto> registerUser(CreateUserRequest userDto) {
        log.debug("Registering new user: {}", userDto.getEmail());

        return Mono.fromCallable(() -> {
            com.ticketkatum.model.CreateUserRequest request = com.ticketkatum.model.CreateUserRequest.builder()
                    .email(userDto.getEmail())
                    .firstName(userDto.getFirstName())
                    .lastName(userDto.getLastName())
                    .password(userDto.getPassword())
                    .phoneNumber(userDto.getPhoneNumber())
                    .role(userDto.getRole())
                    .build();
            com.ticketkatum.model.UserDto response = authService.registerUser(request);
            
            return UserDto.builder()
                    .id(response.getId())
                    .email(response.getEmail())
                    .firstName(response.getFirstName())
                    .lastName(response.getLastName())
                    .phoneNumber(response.getPhoneNumber())
                    .roles(response.getRoles())
                    .enabled(response.getEnabled())
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    /**
     * Refresh token
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<RefreshTokenResponse> refreshToken(String refreshToken, String sessionId) {
        log.debug("Refreshing token for session: {}", sessionId);

        return Mono.fromCallable(() -> {
            Map<String, Object> response = authService.refreshToken(refreshToken, sessionId);
            return RefreshTokenResponse.builder()
                    .accessToken((String) response.get("accessToken"))
                    .tokenType((String) response.get("tokenType"))
                    .build();
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    // ============ Admin Registration & Management ============
    // Temporary Stubs until Admin API is refactored

    public CompletableFuture<RegistrationResponse> registerAdmin(CreateRegistrationRequest request) {
       return CompletableFuture.completedFuture(null); // Stub
    }

    public CompletableFuture<Map> approveAdminRequest(Long requestId) {
        return CompletableFuture.completedFuture(Collections.emptyMap()); // Stub
    }

    public CompletableFuture<Map> rejectAdminRequest(Long requestId) {
        return CompletableFuture.completedFuture(Collections.emptyMap()); // Stub
    }

    public CompletableFuture<List<com.ticketkatum.dto.auth.AdminRegistrationRequestDto>> getAllAdminRequests() {
        return CompletableFuture.completedFuture(Collections.emptyList()); // Stub
    }

    /**
     * Process OAuth2 login
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Map<String, Object>> processOAuth2Login(Map<String, Object> oauth2Request) {
        log.debug("Processing OAuth2 login for email: {}", oauth2Request.get("email"));
        return Mono.fromCallable(() -> {
             com.ticketkatum.model.LoginResponse response = authService.processOAuth2Login(oauth2Request);
             // Convert Model to Map to maintain backward compatibility for now
             // Or can I assume callers can handle LoginResponse?
             // Safest is to map back to Map as per signature.
             return Map.of(
                 "accessToken", response.getAccessToken(),
                 "refreshToken", response.getRefreshToken(),
                 "sessionId", response.getSessionId(),
                 "username", response.getUsername(),
                 "roles", response.getRoles(),
                 "tokenType", response.getTokenType(),
                 "provider", response.getProvider() != null ? response.getProvider() : "unknown"
             );
        })
        .subscribeOn(Schedulers.boundedElastic())
        .toFuture();
    }

    // ============ Fallback Methods ============

    private CompletableFuture<LoginResponse> loginFallback(
            LoginRequest loginRequest, String ipAddress, String userAgent, Throwable ex) {
        log.warn("Fallback: login for user: {}", loginRequest.getUsername(), ex);
        throw new RuntimeException("Authentication service unavailable", ex);
    }

    private CompletableFuture<SessionValidationResponse> validateSessionFallback(
            String sessionId, String token, Throwable ex) {
        log.warn("Fallback: validateSession", ex);
        return CompletableFuture.completedFuture(
                SessionValidationResponse.builder()
                        .valid(false)
                        .message("Session validation unavailable: " + ex.getMessage())
                        .build());
    }

    private CompletableFuture<ActiveSessionsResponse> getActiveSessionsFallback(
            String username, Throwable ex) {
        log.warn("Fallback: getActiveSessions", ex);
        return CompletableFuture.completedFuture(
                ActiveSessionsResponse.builder()
                        .username(username)
                        .sessions(Collections.emptyList())
                        .totalCount(0L)
                        .build());
    }

    private CompletableFuture<Long> getOnlineUserCountFallback(Throwable ex) {
        log.warn("Fallback: getOnlineUserCount", ex);
        return CompletableFuture.completedFuture(0L);
    }

    private CompletableFuture<List<String>> getOnlineUsersFallback(Throwable ex) {
        log.warn("Fallback: getOnlineUsers", ex);
        return CompletableFuture.completedFuture(Collections.emptyList());
    }
}