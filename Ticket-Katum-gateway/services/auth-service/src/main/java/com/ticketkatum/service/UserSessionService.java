package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * User Session Service
 * Manages user sessions in Redis with JWT token binding
 * Handles multi-device login, session validation, and active user tracking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSessionService {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;

    // Redis key prefixes
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user:sessions:";
    private static final String ACTIVE_USERS_KEY = "users:active";
    private static final String SESSION_METADATA_KEY = "session:metadata";

    // Session configuration
    private static final long SESSION_TIMEOUT_SECONDS = 86400L; // 24 hours
    private static final long SESSION_EXTENSION_SECONDS = 86400L; // Extend by 24 hours
    private static final int MAX_SESSIONS_PER_USER = 5; // Limit concurrent sessions

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Create a new session for user with token binding
     * Automatically removes oldest session if max limit exceeded
     */
    public String createSession(String username, String token, Map<String, Object> additionalData) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        try {
            // Check existing sessions and enforce limit
            enforceSessionLimit(username);

            String sessionId = UUID.randomUUID().toString();
            String sessionKey = buildSessionKey(sessionId);
            LocalDateTime now = LocalDateTime.now();

            // Build comprehensive session data
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("sessionId", sessionId);
            sessionData.put("username", username);
            sessionData.put("token", token);
            sessionData.put("createdAt", now.format(DATE_FORMATTER));
            sessionData.put("lastAccessedAt", now.format(DATE_FORMATTER));
            sessionData.put("expiresAt", now.plusSeconds(SESSION_TIMEOUT_SECONDS).format(DATE_FORMATTER));
            sessionData.put("ipAddress", additionalData.getOrDefault("ipAddress", "unknown"));
            sessionData.put("userAgent", additionalData.getOrDefault("userAgent", "unknown"));
            sessionData.put("loginTime", additionalData.getOrDefault("loginTime", System.currentTimeMillis()));

            // Store roles if provided
            if (additionalData.containsKey("roles")) {
                sessionData.put("roles", additionalData.get("roles"));
            }

            // Store session data as hash
            redisTemplate.opsForHash().putAll(sessionKey, sessionData);
            redisTemplate.expire(sessionKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            // Track user's active sessions as Set
            String userSessionsKey = buildUserSessionsKey(username);
            try {
                redisTemplate.opsForSet().add(userSessionsKey, sessionId);
                redisTemplate.expire(userSessionsKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            } catch (RedisSystemException e) {
                log.warn("Detected wrong Redis key type for {}. Deleting and recreating as Set.", userSessionsKey);
                redisTemplate.delete(userSessionsKey);
                redisTemplate.opsForSet().add(userSessionsKey, sessionId);
                redisTemplate.expire(userSessionsKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            }

            // Add to active users ZSet
            redisTemplate.opsForZSet().add(ACTIVE_USERS_KEY, username, now.toEpochSecond(ZoneOffset.UTC));

            // Update session metadata
            updateSessionMetadata(sessionId, username, "created");

            log.info("Created session {} for user {} from IP: {}",
                    sessionId, username, sessionData.get("ipAddress"));

            return sessionId;

        } catch (Exception e) {
            log.error("Error creating session for user {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to create session", e);
        }
    }


    /**
     * Get session data with automatic expiry update
     */
    public Map<Object, Object> getSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            String sessionKey = buildSessionKey(sessionId);
            Map<Object, Object> sessionData = redisTemplate.opsForHash().entries(sessionKey);

            if (sessionData != null && !sessionData.isEmpty()) {
                // Update last accessed time
                String lastAccessed = LocalDateTime.now().format(DATE_FORMATTER);
                sessionData.put("lastAccessedAt", lastAccessed);
                redisTemplate.opsForHash().put(sessionKey, "lastAccessedAt", lastAccessed);
                return sessionData;
            }

            return Collections.emptyMap();

        } catch (Exception e) {
            log.error("Error getting session {}: {}", sessionId, e.getMessage());
            return Collections.emptyMap();
        }
    }


    /**
     * Validate session exists and return username
     */
    public String validateSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return null;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);
            Object username = redisTemplate.opsForHash().get(sessionKey, "username");

            if (username != null) {
                extendSession(sessionId);
                log.debug("Session {} validated for user: {}", sessionId, username);
                return username.toString();
            }

            log.debug("Session validation failed: {}", sessionId);
            return null;

        } catch (Exception e) {
            log.error("Error validating session {}: {}", sessionId, e.getMessage());
            return null;
        }
    }

    /**
     * Validate token matches the session
     * Critical for security - ensures token hasn't been swapped
     */
    public boolean validateTokenWithSession(String sessionId, String token) {
        if (sessionId == null || token == null) {
            log.warn("Null sessionId or token provided for validation");
            return false;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);
            Object storedToken = redisTemplate.opsForHash().get(sessionKey, "token");

            boolean isValid = token.equals(storedToken);

            if (!isValid) {
                log.warn("Token mismatch for session: {}", sessionId);
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error validating token with session {}: {}", sessionId, e.getMessage());
            return false;
        }
    }

    /**
     * Extend session timeout
     */
    public void extendSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);

            // Check if session exists
            Boolean exists = redisTemplate.hasKey(sessionKey);
            if (Boolean.TRUE.equals(exists)) {
                redisTemplate.expire(sessionKey, SESSION_EXTENSION_SECONDS, TimeUnit.SECONDS);

                // Update expiresAt timestamp
                LocalDateTime newExpiry = LocalDateTime.now().plusSeconds(SESSION_EXTENSION_SECONDS);
                redisTemplate.opsForHash().put(sessionKey, "expiresAt", newExpiry.format(DATE_FORMATTER));

                log.debug("Extended session: {}", sessionId);
            }

        } catch (Exception e) {
            log.error("Error extending session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Invalidate specific session (logout)
     */
    public void invalidateSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            log.warn("Attempted to invalidate null or empty sessionId");
            return;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);

            // Get username before deleting
            Object username = redisTemplate.opsForHash().get(sessionKey, "username");

            // Delete session
            redisTemplate.delete(sessionKey);

            if (username != null) {
                String usernameStr = username.toString();

                // Remove from user's sessions
                String userSessionsKey = buildUserSessionsKey(usernameStr);
                redisTemplate.opsForSet().remove(userSessionsKey, sessionId);

                // Check if user has other active sessions
                Long remainingSessions = redisTemplate.opsForSet().size(userSessionsKey);
                if (remainingSessions == null || remainingSessions == 0) {
                    // Remove from active users if no sessions remain
                    redisTemplate.opsForZSet().remove(ACTIVE_USERS_KEY, usernameStr);
                    redisTemplate.delete(userSessionsKey);
                }

                // Update metadata
                updateSessionMetadata(sessionId, usernameStr, "invalidated");
            }

            log.info("Invalidated session: {}", sessionId);

        } catch (Exception e) {
            log.error("Error invalidating session {}: {}", sessionId, e.getMessage(), e);
        }
    }

    /**
     * Invalidate all sessions for a user (logout from all devices)
     * Returns count of invalidated sessions
     */
    public Long invalidateAllUserSessions(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        try {
            String userSessionsKey = buildUserSessionsKey(username);
            Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

            long invalidatedCount = 0;
            if (sessionIds != null && !sessionIds.isEmpty()) {
                for (Object sessionId : sessionIds) {
                    String sessionKey = buildSessionKey(sessionId.toString());
                    Boolean deleted = redisTemplate.delete(sessionKey);
                    if (Boolean.TRUE.equals(deleted)) {
                        invalidatedCount++;
                    }
                }
            }

            // Remove user's sessions set
            redisTemplate.delete(userSessionsKey);

            // Remove from active users
            redisTemplate.opsForZSet().remove(ACTIVE_USERS_KEY, username);

            log.info("Invalidated {} sessions for user {}", invalidatedCount, username);
            return invalidatedCount;

        } catch (Exception e) {
            log.error("Error invalidating all sessions for user {}: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to invalidate sessions", e);
        }
    }

    /**
     * Get all active sessions for a user
     */
    public List<Map<Object, Object>> getUserSessions(String username) {
        if (username == null || username.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String userSessionsKey = buildUserSessionsKey(username);
            Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

            if (sessionIds == null || sessionIds.isEmpty()) {
                return Collections.emptyList();
            }

            List<Map<Object, Object>> sessions = new ArrayList<>();
            for (Object sessionId : sessionIds) {
                String sessionKey = buildSessionKey(sessionId.toString());
                Map<Object, Object> sessionData = redisTemplate.opsForHash().entries(sessionKey);

                if (sessionData != null && !sessionData.isEmpty()) {
                    // Remove sensitive data before returning
                    sessionData.remove("token");
                    sessions.add(sessionData);
                } else {
                    // Clean up stale session reference
                    redisTemplate.opsForSet().remove(userSessionsKey, sessionId);
                }
            }

            return sessions;

        } catch (Exception e) {
            log.error("Error getting sessions for user {}: {}", username, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get count of active users
     */
    public Long getActiveUserCount() {
        try {
            Long count = redisTemplate.opsForZSet().size(ACTIVE_USERS_KEY);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error getting active user count: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * Get all active usernames
     */
    public List<String> getActiveUsers() {
        try {
            Set<Object> users = redisTemplate.opsForZSet().range(ACTIVE_USERS_KEY, 0, -1);
            if (users == null || users.isEmpty()) {
                return Collections.emptyList();
            }

            return users.stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting active users: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Check if user is currently online
     */
    public boolean isUserOnline(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        try {
            Double score = redisTemplate.opsForZSet().score(ACTIVE_USERS_KEY, username);
            return score != null;
        } catch (Exception e) {
            log.error("Error checking if user {} is online: {}", username, e.getMessage());
            return false;
        }
    }

    /**
     * Update session data (for token refresh, etc.)
     */
    public void updateSession(String sessionId, Map<String, Object> updates) {
        if (sessionId == null || updates == null || updates.isEmpty()) {
            return;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);

            // Check if session exists
            Boolean exists = redisTemplate.hasKey(sessionKey);
            if (Boolean.TRUE.equals(exists)) {
                redisTemplate.opsForHash().putAll(sessionKey, updates);
                log.debug("Updated session {} with {} fields", sessionId, updates.size());
            } else {
                log.warn("Attempted to update non-existent session: {}", sessionId);
            }

        } catch (Exception e) {
            log.error("Error updating session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Update specific session data field
     */
    public void updateSessionData(String sessionId, String key, Object value) {
        if (sessionId == null || key == null) {
            return;
        }

        try {
            String sessionKey = buildSessionKey(sessionId);
            redisTemplate.opsForHash().put(sessionKey, key, value);
            log.debug("Updated session {} field: {}={}", sessionId, key, value);

        } catch (Exception e) {
            log.error("Error updating session {} field {}: {}", sessionId, key, e.getMessage());
        }
    }

    /**
     * Get session count for user (detect multiple devices)
     */
    public Long getUserSessionCount(String username) {
        if (username == null || username.trim().isEmpty()) {
            return 0L;
        }

        try {
            String userSessionsKey = buildUserSessionsKey(username);
            Long count = redisTemplate.opsForSet().size(userSessionsKey);
            return count != null ? count : 0L;

        } catch (Exception e) {
            log.error("Error getting session count for user {}: {}", username, e.getMessage());
            return 0L;
        }
    }

    /**
     * Enforce maximum sessions per user
     * Removes oldest session if limit exceeded
     */
    private void enforceSessionLimit(String username) {
        try {
            String userSessionsKey = buildUserSessionsKey(username);
            Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

            if (sessionIds != null && sessionIds.size() >= MAX_SESSIONS_PER_USER) {
                // Find oldest session
                String oldestSessionId = null;
                LocalDateTime oldestTime = LocalDateTime.now();

                for (Object sessionId : sessionIds) {
                    String sessionKey = buildSessionKey(sessionId.toString());
                    Object createdAtObj = redisTemplate.opsForHash().get(sessionKey, "createdAt");

                    if (createdAtObj != null) {
                        LocalDateTime createdAt = LocalDateTime.parse(createdAtObj.toString(), DATE_FORMATTER);
                        if (createdAt.isBefore(oldestTime)) {
                            oldestTime = createdAt;
                            oldestSessionId = sessionId.toString();
                        }
                    }
                }

                // Remove oldest session
                if (oldestSessionId != null) {
                    invalidateSession(oldestSessionId);
                    log.info("Removed oldest session {} for user {} (limit: {})",
                            oldestSessionId, username, MAX_SESSIONS_PER_USER);
                }
            }

        } catch (Exception e) {
            log.error("Error enforcing session limit for user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Update session metadata for analytics
     */
    private void updateSessionMetadata(String sessionId, String username, String action) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("sessionId", sessionId);
            metadata.put("username", username);
            metadata.put("action", action);
            metadata.put("timestamp", LocalDateTime.now().format(DATE_FORMATTER));

            String metadataKey = SESSION_METADATA_KEY + ":" + sessionId;
            redisTemplate.opsForHash().putAll(metadataKey, metadata);
            redisTemplate.expire(metadataKey, 7, TimeUnit.DAYS); // Keep for 7 days

        } catch (Exception e) {
            log.debug("Error updating session metadata: {}", e.getMessage());
        }
    }

    /**
     * Build session key with prefix
     */
    private String buildSessionKey(String sessionId) {
        return SESSION_KEY_PREFIX + sessionId;
    }

    /**
     * Build user sessions key with prefix
     */
    private String buildUserSessionsKey(String username) {
        return USER_SESSIONS_KEY_PREFIX + username;
    }

    /**
     * Clean up expired sessions (can be scheduled)
     */
    public void cleanupExpiredSessions() {
        try {
            // Redis TTL handles automatic cleanup
            // This method can be used for additional cleanup logic if needed
            log.info("Session cleanup executed");

        } catch (Exception e) {
            log.error("Error during session cleanup: {}", e.getMessage());
        }
    }
}