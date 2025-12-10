package com.ticketkatum.service;

import com.ticketkatum.client.AuthServiceClient;
import com.ticketkatum.client.UserServiceClient;
import com.ticketkatum.dto.AggregatedLoginResponse;
import com.ticketkatum.dto.AggregatedUserDashboard;
import com.ticketkatum.dto.auth.*;
import com.ticketkatum.dto.auth.request.LoginRequest;
import com.ticketkatum.dto.auth.response.SessionValidationResponse;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Authentication Domain Aggregator
 * Handles all auth and user-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthAggregator {

    private final AuthServiceClient authClient;
    private final UserServiceClient userClient;

    /**
     * Login with profile aggregation
     */
    public CompletableFuture<AggregatedLoginResponse> loginWithProfile(
            LoginRequest loginRequest, String ipAddress, String userAgent) {

        log.info("Aggregated login for user: {}", loginRequest.getUsername());

        return authClient.login(loginRequest, ipAddress, userAgent)
                .thenCompose(loginResponse -> {
                    if (loginResponse == null) {
                        throw new AggregationException("Login failed: empty response from auth service");
                    }
                    CompletableFuture<UserDto> userFuture =
                            userClient.getUserById(extractUserId(loginResponse.getUsername()));

                    CompletableFuture<Long> onlineCountFuture =
                            authClient.getOnlineUserCount();

                    return CompletableFuture.allOf(userFuture, onlineCountFuture)
                            .thenApply(v -> AggregatedLoginResponse.builder()
                                    .authData(loginResponse)
                                    .userProfile(userFuture.join())
                                    .onlineUserCount(onlineCountFuture.join())
                                    .recentBookings(Collections.emptyList())
                                    .userPreferences(new HashMap<>())
                                    .build()
                            );
                })
                .exceptionally(ex -> {
                    log.error("Error in aggregated login", ex);
                    throw new AggregationException("Login aggregation failed", ex);
                });

    }


    /**
     * Get user dashboard with bookings and statistics
     */
    public CompletableFuture<AggregatedUserDashboard> getUserDashboard(
            String username, Integer userId) {

        log.info("Fetching user dashboard for: {}", username);

        CompletableFuture<UserDto> userFuture = userClient.getUserById(userId);
        CompletableFuture<ActiveSessionsResponse> sessionsFuture =
                authClient.getActiveSessions(username);

        return CompletableFuture.allOf(userFuture, sessionsFuture)
                .thenApply(v -> {
                    UserDto user = userFuture.join();
                    ActiveSessionsResponse sessions = sessionsFuture.join();

                    // Build dashboard with available data
                    UserStatistics statistics = UserStatistics.builder()
                            .totalBookings(0)
                            .completedBookings(0)
                            .cancelledBookings(0)
                            .upcomingBookings(0)
                            .totalSpent(BigDecimal.ZERO)
                            .averageBookingValue(BigDecimal.ZERO)
                            .loyaltyPoints(0)
                            .build();

                    return AggregatedUserDashboard.builder()
                            .user(user)
                            .recentBookings(Collections.emptyList())
                            .upcomingBookings(Collections.emptyList())
                            .statistics(statistics)
                            .paymentHistory(Collections.emptyList())
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Error fetching user dashboard", ex);
                    throw new AggregationException("Dashboard fetch failed", ex);
                });
    }

    /**
     * Validate session with extended information
     */
    public CompletableFuture<SessionValidationResponse> validateSessionWithDetails(
            String sessionId, String token) {

        log.info("Validating session with details: {}", sessionId);

        return authClient.validateSession(sessionId, token)
                .thenApply(validation -> {
                    // Can add additional enrichment here if needed
                    return validation;
                })
                .exceptionally(ex -> {
                    log.error("Session validation failed", ex);
                    return SessionValidationResponse.builder()
                            .valid(false)
                            .message("Validation failed")
                            .build();
                });
    }

    /**
     * Get user activity summary
     */
    public CompletableFuture<UserActivitySummary> getUserActivitySummary(String username) {
        log.info("Fetching activity summary for: {}", username);

        CompletableFuture<ActiveSessionsResponse> sessionsFuture =
                authClient.getActiveSessions(username);

        CompletableFuture<List<String>> onlineUsersFuture =
                authClient.getOnlineUsers();

        return CompletableFuture.allOf(sessionsFuture, onlineUsersFuture)
                .thenApply(v -> {
                    ActiveSessionsResponse sessions = sessionsFuture.join();
                    List<String> onlineUsers = onlineUsersFuture.join();

                    return UserActivitySummary.builder()
                            .username(username)
                            .isOnline(onlineUsers.contains(username))
                            .activeSessionCount(sessions.getTotalCount())
                            .lastActivity(LocalDateTime.now())
                            .build();
                });
    }

    // ============ Helper Methods ============

    private Integer extractUserId(String username) {
        // TODO: Implement actual user ID extraction
        return 1;
    }

}
