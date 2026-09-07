package com.ticketkatum.controller;

import com.ticketkatum.client.AuthServiceClient;
import com.ticketkatum.client.UserServiceClient;
import com.ticketkatum.dto.AggregatedLoginResponse;
import com.ticketkatum.dto.AggregatedUserDashboard;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.auth.ActiveSessionsResponse;
import com.ticketkatum.dto.auth.CreateUserRequest;
import com.ticketkatum.dto.auth.UserActivitySummary;
import com.ticketkatum.dto.auth.UserDto;
import com.ticketkatum.dto.auth.request.LoginRequest;
import com.ticketkatum.dto.auth.response.LogoutAllResponse;
import com.ticketkatum.dto.auth.response.LogoutResponse;
import com.ticketkatum.dto.auth.response.RefreshTokenResponse;
import com.ticketkatum.dto.auth.response.SessionValidationResponse;
import com.ticketkatum.dto.request.UpdateUserRequest;
import com.ticketkatum.service.AuthAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Authentication BFF Controller
 * Handles authentication and user management with aggregated data
 * Uses AuthAggregator for domain-specific logic
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth BFF", description = "Authentication and user management aggregated APIs")
public class AuthBffController {

    private final AuthAggregator authAggregator;
    private final AuthServiceClient authClient;
    private final UserServiceClient userClient;

    /**
     * Login with profile and preferences
     * Aggregates: authentication, user profile, online users
     */
    @PostMapping("/login")
    @Operation(summary = "Login with profile",
            description = "Authenticate user and return profile with preferences")
    public CompletableFuture<ResponseEntity<Response<AggregatedLoginResponse>>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        log.info("BFF: Login request for user: {}", loginRequest.getUsername());

        String ipAddress = getClientIP(request);
        String userAgent = getUserAgent(request);

        return authAggregator.loginWithProfile(loginRequest, ipAddress, userAgent)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Login successful", response)))
                .exceptionally(ex -> {
                    log.error("Login failed", ex);
                    Throwable cause = ex;
                    while (cause instanceof java.util.concurrent.CompletionException || cause instanceof java.util.concurrent.ExecutionException) {
                        if (cause.getCause() != null) {
                            cause = cause.getCause();
                        } else {
                            break;
                        }
                    }
                    String errorMsg = cause.getMessage() != null ? cause.getMessage() : "Invalid credentials";
                    if (cause instanceof org.springframework.security.authentication.BadCredentialsException) {
                        errorMsg = "Invalid email or password";
                    } else if (cause instanceof org.springframework.security.core.userdetails.UsernameNotFoundException) {
                        errorMsg = "User not found with provided credentials";
                    }
                    return ResponseEntity.status(401).body(
                            new Response<>(401, errorMsg, null));
                });
    }

    /**
     * Logout from current session
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout from current session")
    public CompletableFuture<ResponseEntity<Response<LogoutResponse>>> logout(
            @RequestHeader("Session-Id") String sessionId) {

        log.info("BFF: Logout request for session: {}", sessionId);

        return authClient.logout(sessionId)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Logged out successfully", response)))
                .exceptionally(ex -> {
                    log.error("Logout failed", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Logout failed", null));
                });
    }

    /**
     * Logout from all devices
     */
    @PostMapping("/logout-all")
    @Operation(summary = "Logout all devices",
            description = "Logout from all active sessions")
    public CompletableFuture<ResponseEntity<Response<LogoutAllResponse>>> logoutAll(
            @RequestHeader("Username") String username) {

        log.info("BFF: Logout all devices for user: {}", username);

        return authClient.logoutAllDevices(username)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Logged out from all devices", response)))
                .exceptionally(ex -> {
                    log.error("Logout all failed", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Logout all failed", null));
                });
    }

    /**
     * Get user dashboard with bookings and sessions
     * Aggregates: user profile, bookings, sessions, statistics
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get user dashboard",
            description = "Returns complete user dashboard with bookings and statistics")
    public CompletableFuture<ResponseEntity<Response<AggregatedUserDashboard>>> getUserDashboard(
            @RequestHeader("Username") String username,
            @RequestHeader("User-Id") Integer userId) {

        log.info("BFF: Fetching user dashboard for: {}", username);

        return authAggregator.getUserDashboard(username, userId)
                .thenApply(dashboard -> ResponseEntity.ok(
                        new Response<>(200, "Dashboard retrieved successfully", dashboard)))
                .exceptionally(ex -> {
                    log.error("Dashboard fetch failed", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Dashboard fetch failed", null));
                });
    }

    /**
     * Validate session with extended details
     */
    @GetMapping("/session/validate")
    @Operation(summary = "Validate session", description = "Validate current session with details")
    public CompletableFuture<ResponseEntity<Response<SessionValidationResponse>>> validateSession(
            @RequestHeader("Session-Id") String sessionId,
            @RequestHeader("Authorization") String authHeader) {

        log.info("BFF: Validating session: {}", sessionId);

        String token = authHeader.substring(7);

        return authAggregator.validateSessionWithDetails(sessionId, token)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Session validated", response)))
                .exceptionally(ex -> {
                    log.error("Session validation failed", ex);
                    return ResponseEntity.status(401).body(
                            new Response<>(401, "Invalid session", null));
                });
    }

    /**
     * Get active sessions
     */
    @GetMapping("/sessions/active")
    @Operation(summary = "Get active sessions",
            description = "Get all active sessions for user")
    public CompletableFuture<ResponseEntity<Response<ActiveSessionsResponse>>> getActiveSessions(
            @RequestHeader("Username") String username) {

        log.info("BFF: Fetching active sessions for: {}", username);

        return authClient.getActiveSessions(username)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Active sessions retrieved", response)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch sessions", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch sessions", null));
                });
    }

    /**
     * Get user activity summary
     */
    @GetMapping("/activity/{username}")
    @Operation(summary = "Get user activity summary",
            description = "Get comprehensive user activity information")
    public CompletableFuture<ResponseEntity<Response<UserActivitySummary>>> getUserActivity(
            @PathVariable String username) {

        log.info("BFF: Fetching activity summary for: {}", username);

        return authAggregator.getUserActivitySummary(username)
                .thenApply(activity -> ResponseEntity.ok(
                        new Response<>(200, "Activity retrieved", activity)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch activity", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Activity fetch failed", null));
                });
    }

    /**
     * Get online users count
     */
    @GetMapping("/users/online/count")
    @Operation(summary = "Get online users count")
    public CompletableFuture<ResponseEntity<Response<Long>>> getOnlineUserCount() {
        log.info("BFF: Fetching online user count");

        return authClient.getOnlineUserCount()
                .thenApply(count -> ResponseEntity.ok(
                        new Response<>(200, "Online count retrieved", count)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch online count", ex);
                    return ResponseEntity.ok(
                            new Response<>(200, "Count unavailable", 0L));
                });
    }

    /**
     * Get all online users
     */
    @GetMapping("/users/online")
    @Operation(summary = "Get online users", description = "Get list of all online users")
    public CompletableFuture<ResponseEntity<Response<List<String>>>> getOnlineUsers() {
        log.info("BFF: Fetching online users");

        return authClient.getOnlineUsers()
                .thenApply(users -> ResponseEntity.ok(
                        new Response<>(200, "Online users retrieved", users)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch online users", ex);
                    return ResponseEntity.ok(
                            new Response<>(200, "Users unavailable", java.util.Collections.emptyList()));
                });
    }

    /**
     * Register new user
     */
    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Register new user account")
    public CompletableFuture<ResponseEntity<Response<UserDto>>> register(
            @Valid @RequestBody CreateUserRequest userDto) {

        log.info("BFF: Registering new user: {}", userDto.getEmail());

        return authClient.registerUser(userDto)
                .thenApply(user -> ResponseEntity.status(201).body(
                        new Response<>(201, "User registered successfully", user)))
                .exceptionally(ex -> {
                    log.error("Registration failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Registration failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Register new admin (Request)
     */
    @PostMapping("/register/admin")
    @Operation(summary = "Register admin", description = "Register new admin account (Pending Approval)")
    public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.auth.response.RegistrationResponse>>> registerAdmin(
            @Valid @RequestBody com.ticketkatum.dto.auth.request.CreateRegistrationRequest request) {

        log.info("BFF: Registering new admin: {}", request.getEmail());

        return authClient.registerAdmin(request)
                .thenApply(response -> ResponseEntity.status(201).body(
                        new Response<>(201, "Admin registration request submitted", response)))
                .exceptionally(ex -> {
                    log.error("Admin registration failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Registration failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Refresh token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token")
    public CompletableFuture<ResponseEntity<Response<RefreshTokenResponse>>> refreshToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader("Session-Id") String sessionId) {

        log.info("BFF: Refreshing token for session: {}", sessionId);

        String refreshToken = authHeader.substring(7);

        return authClient.refreshToken(refreshToken, sessionId)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Token refreshed", response)))
                .exceptionally(ex -> {
                    log.error("Token refresh failed", ex);
                    return ResponseEntity.status(401).body(
                            new Response<>(401, "Token refresh failed", null));
                });
    }

    /**
     * Get user profile
     */
    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get user profile")
    public CompletableFuture<ResponseEntity<Response<UserDto>>> getUserProfile(
            @PathVariable Integer userId) {

        log.info("BFF: Fetching user profile: {}", userId);

        return userClient.getUserById(userId)
                .thenApply(user -> ResponseEntity.ok(
                        new Response<>(200, "Profile retrieved", user)))
                .exceptionally(ex -> {
                    log.error("Profile fetch failed", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "User not found", null));
                });
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile/{userId}")
    @Operation(summary = "Update user profile")
    public CompletableFuture<ResponseEntity<Response<UserDto>>> updateProfile(
            @PathVariable Integer userId,
            @Valid @RequestBody UpdateUserRequest userDto) {

        log.info("BFF: Updating user profile: {}", userId);

        return userClient.updateUser(userId, userDto)
                .thenApply(user -> ResponseEntity.ok(
                        new Response<>(200, "Profile updated", user)))
                .exceptionally(ex -> {
                    log.error("Profile update failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Update failed", null));
                });
    }

    // Helper methods
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}