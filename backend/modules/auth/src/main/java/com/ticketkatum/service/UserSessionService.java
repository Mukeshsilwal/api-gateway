package com.ticketkatum.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * User Session Service
 * Manages user sessions in Redis with JWT token binding, with in-memory fallback
 * when Redis is disabled or unavailable.
 * Handles multi-device login, session validation, and active user tracking.
 */
@Service
@Slf4j
public class UserSessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final boolean redisEnabled;

    // In-memory fallback stores when Redis is disabled or unavailable
    private final Map<String, Map<String, Object>> inMemorySessions = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> inMemoryUserSessions = new ConcurrentHashMap<>();
    private final Map<String, Long> inMemoryActiveUsers = new ConcurrentHashMap<>();

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

    public UserSessionService(
            @Qualifier("customRedisTemplate") @Autowired(required = false) RedisTemplate<String, Object> redisTemplate,
            @Value("${cache.redis.enabled:false}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.redisEnabled = redisEnabled;
        log.info("UserSessionService initialized. Redis enabled: {}, RedisTemplate present: {}",
                redisEnabled, redisTemplate != null);
    }

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
            String sessionId = UUID.randomUUID().toString();
            LocalDateTime now = LocalDateTime.now();

            // Build comprehensive session data
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("sessionId", sessionId);
            sessionData.put("username", username);
            sessionData.put("token", token);
            sessionData.put("createdAt", now.format(DATE_FORMATTER));
            sessionData.put("lastAccessedAt", now.format(DATE_FORMATTER));
            sessionData.put("expiresAt", now.plusSeconds(SESSION_TIMEOUT_SECONDS).format(DATE_FORMATTER));
            sessionData.put("ipAddress", additionalData != null ? additionalData.getOrDefault("ipAddress", "unknown") : "unknown");
            sessionData.put("userAgent", additionalData != null ? additionalData.getOrDefault("userAgent", "unknown") : "unknown");
            sessionData.put("loginTime", additionalData != null ? additionalData.getOrDefault("loginTime", System.currentTimeMillis()) : System.currentTimeMillis());

            // Store roles if provided
            if (additionalData != null && additionalData.containsKey("roles")) {
                sessionData.put("roles", additionalData.get("roles"));
            }

            // Always store in in-memory map
            saveInMemorySession(sessionId, username, sessionData, now);

            // If Redis is enabled, also persist to Redis
            if (redisEnabled && redisTemplate != null) {
                try {
                    enforceSessionLimit(username);
                    String sessionKey = buildSessionKey(sessionId);
                    redisTemplate.opsForHash().putAll(sessionKey, sessionData);
                    redisTemplate.expire(sessionKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

                    String userSessionsKey = buildUserSessionsKey(username);
                    try {
                        redisTemplate.opsForZSet().add(userSessionsKey, sessionId, now.toEpochSecond(ZoneOffset.UTC));
                        redisTemplate.expire(userSessionsKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                    } catch (RedisSystemException e) {
                        log.warn("Detected wrong Redis key type for {}. Deleting and recreating as ZSet.", userSessionsKey);
                        redisTemplate.delete(userSessionsKey);
                        redisTemplate.opsForZSet().add(userSessionsKey, sessionId, now.toEpochSecond(ZoneOffset.UTC));
                        redisTemplate.expire(userSessionsKey, SESSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                    }

                    redisTemplate.opsForZSet().add(ACTIVE_USERS_KEY, username, now.toEpochSecond(ZoneOffset.UTC));
                    updateSessionMetadata(sessionId, username, "created");
                } catch (Exception e) {
                    log.warn("Redis unavailable for session storage, continuing with in-memory session: {}", e.getMessage());
                }
            }

            log.info("Created session {} for user {} from IP: {}",
                    sessionId, username, sessionData.get("ipAddress"));

            return sessionId;

        } catch (Exception e) {
            log.error("Error creating session for user {}, using fallback: {}", username, e.getMessage(), e);
            String fallbackSessionId = UUID.randomUUID().toString();
            Map<String, Object> fallbackData = new HashMap<>();
            fallbackData.put("sessionId", fallbackSessionId);
            fallbackData.put("username", username);
            fallbackData.put("token", token);
            inMemorySessions.put(fallbackSessionId, fallbackData);
            return fallbackSessionId;
        }
    }

    /**
     * Get session data with automatic expiry update
     */
    public Map<Object, Object> getSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Collections.emptyMap();
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Map<Object, Object> sessionData = redisTemplate.opsForHash().entries(sessionKey);

                if (sessionData != null && !sessionData.isEmpty()) {
                    String lastAccessed = LocalDateTime.now().format(DATE_FORMATTER);
                    sessionData.put("lastAccessedAt", lastAccessed);
                    redisTemplate.opsForHash().put(sessionKey, "lastAccessedAt", lastAccessed);
                    return sessionData;
                }
            } catch (Exception e) {
                log.debug("Redis error getting session {}, checking in-memory fallback: {}", sessionId, e.getMessage());
            }
        }

        // In-memory fallback
        Map<String, Object> memData = inMemorySessions.get(sessionId);
        if (memData != null) {
            String expiresAtStr = (String) memData.get("expiresAt");
            if (expiresAtStr != null) {
                try {
                    LocalDateTime expiresAt = LocalDateTime.parse(expiresAtStr, DATE_FORMATTER);
                    if (LocalDateTime.now().isAfter(expiresAt)) {
                        invalidateSession(sessionId);
                        return Collections.emptyMap();
                    }
                } catch (Exception ignored) {}
            }
            String lastAccessed = LocalDateTime.now().format(DATE_FORMATTER);
            memData.put("lastAccessedAt", lastAccessed);
            return new HashMap<>(memData);
        }

        return Collections.emptyMap();
    }

    /**
     * Validate session exists and return username
     */
    public String validateSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return null;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Object username = redisTemplate.opsForHash().get(sessionKey, "username");

                if (username != null) {
                    extendSession(sessionId);
                    log.debug("Session {} validated for user: {}", sessionId, username);
                    return username.toString();
                }
            } catch (Exception e) {
                log.debug("Redis error validating session {}: {}", sessionId, e.getMessage());
            }
        }

        // In-memory fallback
        Map<Object, Object> session = getSession(sessionId);
        if (session != null && !session.isEmpty()) {
            Object username = session.get("username");
            if (username != null) {
                extendSession(sessionId);
                log.debug("Session {} validated in memory for user: {}", sessionId, username);
                return username.toString();
            }
        }

        log.debug("Session validation failed: {}", sessionId);
        return null;
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

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Object storedToken = redisTemplate.opsForHash().get(sessionKey, "token");
                if (storedToken != null) {
                    boolean isValid = token.equals(storedToken);
                    if (!isValid) {
                        log.warn("Token mismatch for session: {}", sessionId);
                    }
                    return isValid;
                }
            } catch (Exception e) {
                log.debug("Redis error validating token with session {}: {}", sessionId, e.getMessage());
            }
        }

        // In-memory fallback
        Map<Object, Object> session = getSession(sessionId);
        if (session != null && !session.isEmpty()) {
            Object storedToken = session.get("token");
            boolean isValid = token.equals(storedToken);
            if (!isValid) {
                log.warn("Token mismatch for session: {}", sessionId);
            }
            return isValid;
        }

        return false;
    }

    /**
     * Extend session timeout
     */
    public void extendSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Object username = redisTemplate.opsForHash().get(sessionKey, "username");

                if (username != null) {
                    redisTemplate.executePipelined(new org.springframework.data.redis.core.SessionCallback<Object>() {
                        @Override
                        public Object execute(org.springframework.data.redis.core.RedisOperations operations) {
                            operations.expire(sessionKey, SESSION_EXTENSION_SECONDS, TimeUnit.SECONDS);
                            LocalDateTime newExpiry = LocalDateTime.now().plusSeconds(SESSION_EXTENSION_SECONDS);
                            operations.opsForHash().put(sessionKey, "expiresAt", newExpiry.format(DATE_FORMATTER));
                            operations.opsForZSet().add(ACTIVE_USERS_KEY, username, Instant.now().getEpochSecond());
                            return null;
                        }
                    });
                    log.debug("Extended session: {}", sessionId);
                }
            } catch (Exception e) {
                log.debug("Redis error extending session {}: {}", sessionId, e.getMessage());
            }
        }

        // In-memory extension
        Map<String, Object> memData = inMemorySessions.get(sessionId);
        if (memData != null) {
            LocalDateTime newExpiry = LocalDateTime.now().plusSeconds(SESSION_EXTENSION_SECONDS);
            memData.put("expiresAt", newExpiry.format(DATE_FORMATTER));
            String username = (String) memData.get("username");
            if (username != null) {
                inMemoryActiveUsers.put(username, Instant.now().getEpochSecond());
            }
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

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Object username = redisTemplate.opsForHash().get(sessionKey, "username");
                redisTemplate.delete(sessionKey);

                if (username != null) {
                    String usernameStr = username.toString();
                    String userSessionsKey = buildUserSessionsKey(usernameStr);
                    redisTemplate.opsForZSet().remove(userSessionsKey, sessionId);

                    Long remainingSessions = redisTemplate.opsForZSet().zCard(userSessionsKey);
                    if (remainingSessions == null || remainingSessions == 0) {
                        redisTemplate.opsForZSet().remove(ACTIVE_USERS_KEY, usernameStr);
                        redisTemplate.delete(userSessionsKey);
                    }
                    updateSessionMetadata(sessionId, usernameStr, "invalidated");
                }
            } catch (Exception e) {
                log.debug("Redis error invalidating session {}: {}", sessionId, e.getMessage());
            }
        }

        // In-memory removal
        Map<String, Object> removed = inMemorySessions.remove(sessionId);
        if (removed != null) {
            String username = (String) removed.get("username");
            if (username != null) {
                Set<String> userSessions = inMemoryUserSessions.get(username);
                if (userSessions != null) {
                    userSessions.remove(sessionId);
                    if (userSessions.isEmpty()) {
                        inMemoryUserSessions.remove(username);
                        inMemoryActiveUsers.remove(username);
                    }
                }
            }
        }

        log.info("Invalidated session: {}", sessionId);
    }

    /**
     * Invalidate all sessions for a user (logout from all devices)
     * Returns count of invalidated sessions
     */
    public Long invalidateAllUserSessions(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        long invalidatedCount = 0;

        if (redisEnabled && redisTemplate != null) {
            try {
                String userSessionsKey = buildUserSessionsKey(username);
                Set<Object> sessionIds = redisTemplate.opsForZSet().range(userSessionsKey, 0, -1);

                if (sessionIds != null && !sessionIds.isEmpty()) {
                    for (Object sessionId : sessionIds) {
                        String sessionKey = buildSessionKey(sessionId.toString());
                        Boolean deleted = redisTemplate.delete(sessionKey);
                        if (Boolean.TRUE.equals(deleted)) {
                            invalidatedCount++;
                        }
                    }
                }

                redisTemplate.delete(userSessionsKey);
                redisTemplate.opsForZSet().remove(ACTIVE_USERS_KEY, username);
            } catch (Exception e) {
                log.debug("Redis error invalidating all sessions for user {}: {}", username, e.getMessage());
            }
        }

        // In-memory removal
        Set<String> sessions = inMemoryUserSessions.remove(username);
        if (sessions != null) {
            for (String sId : sessions) {
                inMemorySessions.remove(sId);
                invalidatedCount++;
            }
        }
        inMemoryActiveUsers.remove(username);

        log.info("Invalidated {} sessions for user {}", invalidatedCount, username);
        return invalidatedCount;
    }

    /**
     * Get all active sessions for a user
     */
    public List<Map<Object, Object>> getUserSessions(String username) {
        if (username == null || username.trim().isEmpty()) {
            return Collections.emptyList();
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String userSessionsKey = buildUserSessionsKey(username);
                Set<Object> sessionIds = redisTemplate.opsForZSet().range(userSessionsKey, 0, -1);

                if (sessionIds != null && !sessionIds.isEmpty()) {
                    List<Object> sessionIdList = new ArrayList<>(sessionIds);
                    List<Object> results = redisTemplate.executePipelined(new org.springframework.data.redis.core.SessionCallback<Object>() {
                        @Override
                        public Object execute(org.springframework.data.redis.core.RedisOperations operations) {
                            for (Object sessionId : sessionIdList) {
                                String sessionKey = buildSessionKey(sessionId.toString());
                                operations.opsForHash().entries(sessionKey);
                            }
                            return null;
                        }
                    });

                    List<Map<Object, Object>> sessions = new ArrayList<>();
                    for (int i = 0; i < results.size(); i++) {
                        Object result = results.get(i);
                        Object sessionId = sessionIdList.get(i);

                        if (result instanceof Map && !((Map<?, ?>) result).isEmpty()) {
                            Map<Object, Object> sessionData = (Map<Object, Object>) result;
                            sessionData.remove("token");
                            sessions.add(sessionData);
                        } else {
                            redisTemplate.opsForZSet().remove(userSessionsKey, sessionId);
                        }
                    }
                    return sessions;
                }
            } catch (Exception e) {
                log.debug("Redis error getting sessions for user {}: {}", username, e.getMessage());
            }
        }

        // In-memory fallback
        Set<String> sessions = inMemoryUserSessions.get(username);
        if (sessions == null || sessions.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<Object, Object>> result = new ArrayList<>();
        for (String sId : sessions) {
            Map<String, Object> data = inMemorySessions.get(sId);
            if (data != null) {
                Map<Object, Object> copy = new HashMap<>(data);
                copy.remove("token");
                result.add(copy);
            }
        }
        return result;
    }

    /**
     * Get count of active users
     */
    public Long getActiveUserCount() {
        if (redisEnabled && redisTemplate != null) {
            try {
                Long count = redisTemplate.opsForZSet().size(ACTIVE_USERS_KEY);
                if (count != null && count > 0) {
                    return count;
                }
            } catch (Exception e) {
                log.debug("Redis error getting active user count: {}", e.getMessage());
            }
        }
        return (long) inMemoryActiveUsers.size();
    }

    /**
     * Get all active usernames
     */
    public List<String> getActiveUsers() {
        if (redisEnabled && redisTemplate != null) {
            try {
                Set<Object> users = redisTemplate.opsForZSet().range(ACTIVE_USERS_KEY, 0, -1);
                if (users != null && !users.isEmpty()) {
                    return users.stream().map(Object::toString).collect(Collectors.toList());
                }
            } catch (Exception e) {
                log.debug("Redis error getting active users: {}", e.getMessage());
            }
        }
        return new ArrayList<>(inMemoryActiveUsers.keySet());
    }

    /**
     * Check if user is currently online
     */
    public boolean isUserOnline(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                Double score = redisTemplate.opsForZSet().score(ACTIVE_USERS_KEY, username);
                if (score != null) {
                    return true;
                }
            } catch (Exception e) {
                log.debug("Redis error checking if user {} is online: {}", username, e.getMessage());
            }
        }
        return inMemoryActiveUsers.containsKey(username);
    }

    /**
     * Update session data (for token refresh, etc.)
     */
    public void updateSession(String sessionId, Map<String, Object> updates) {
        if (sessionId == null || updates == null || updates.isEmpty()) {
            return;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                Boolean exists = redisTemplate.hasKey(sessionKey);
                if (Boolean.TRUE.equals(exists)) {
                    redisTemplate.opsForHash().putAll(sessionKey, updates);
                    log.debug("Updated session {} with {} fields in Redis", sessionId, updates.size());
                }
            } catch (Exception e) {
                log.debug("Redis error updating session {}: {}", sessionId, e.getMessage());
            }
        }

        Map<String, Object> mem = inMemorySessions.get(sessionId);
        if (mem != null) {
            mem.putAll(updates);
        }
    }

    /**
     * Update specific session data field
     */
    public void updateSessionData(String sessionId, String key, Object value) {
        if (sessionId == null || key == null) {
            return;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String sessionKey = buildSessionKey(sessionId);
                redisTemplate.opsForHash().put(sessionKey, key, value);
                log.debug("Updated session {} field: {}={} in Redis", sessionId, key, value);
            } catch (Exception e) {
                log.debug("Redis error updating session {} field {}: {}", sessionId, key, e.getMessage());
            }
        }

        Map<String, Object> mem = inMemorySessions.get(sessionId);
        if (mem != null) {
            mem.put(key, value);
        }
    }

    /**
     * Get session count for user (detect multiple devices)
     */
    public Long getUserSessionCount(String username) {
        if (username == null || username.trim().isEmpty()) {
            return 0L;
        }

        if (redisEnabled && redisTemplate != null) {
            try {
                String userSessionsKey = buildUserSessionsKey(username);
                Long count = redisTemplate.opsForZSet().zCard(userSessionsKey);
                if (count != null && count > 0) {
                    return count;
                }
            } catch (Exception e) {
                log.debug("Redis error getting session count for user {}: {}", username, e.getMessage());
            }
        }

        Set<String> userSessions = inMemoryUserSessions.get(username);
        return userSessions != null ? (long) userSessions.size() : 0L;
    }

    /**
     * Enforce maximum sessions per user
     */
    private void enforceSessionLimit(String username) {
        try {
            String userSessionsKey = buildUserSessionsKey(username);
            Long count = redisTemplate.opsForZSet().zCard(userSessionsKey);

            if (count != null && count >= MAX_SESSIONS_PER_USER) {
                Set<Object> oldest = redisTemplate.opsForZSet().range(userSessionsKey, 0, 0);
                if (oldest != null && !oldest.isEmpty()) {
                    Object oldestSessionId = oldest.iterator().next();
                    invalidateSession(oldestSessionId.toString());
                    log.info("Removed oldest session {} for user {} (limit: {})",
                            oldestSessionId, username, MAX_SESSIONS_PER_USER);
                }
            }
        } catch (Exception e) {
            log.debug("Error enforcing session limit for user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Save session to in-memory store
     */
    private void saveInMemorySession(String sessionId, String username, Map<String, Object> sessionData, LocalDateTime now) {
        Set<String> userSessions = inMemoryUserSessions.computeIfAbsent(username, k -> Collections.synchronizedSet(new LinkedHashSet<>()));
        if (userSessions.size() >= MAX_SESSIONS_PER_USER) {
            synchronized (userSessions) {
                Iterator<String> it = userSessions.iterator();
                if (it.hasNext()) {
                    String oldestId = it.next();
                    it.remove();
                    inMemorySessions.remove(oldestId);
                    log.info("Removed oldest in-memory session {} for user {} (limit: {})", oldestId, username, MAX_SESSIONS_PER_USER);
                }
            }
        }
        inMemorySessions.put(sessionId, new ConcurrentHashMap<>(sessionData));
        userSessions.add(sessionId);
        inMemoryActiveUsers.put(username, now.toEpochSecond(ZoneOffset.UTC));
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
            redisTemplate.expire(metadataKey, 7, TimeUnit.DAYS);
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
     * Clean up expired sessions
     */
    public void cleanupExpiredSessions() {
        if (redisEnabled && redisTemplate != null) {
            try {
                long cutoffTimestamp = Instant.now().getEpochSecond() - SESSION_TIMEOUT_SECONDS;
                redisTemplate.opsForZSet().removeRangeByScore(ACTIVE_USERS_KEY, 0, cutoffTimestamp);
                log.info("Session cleanup executed: removed inactive users from Redis");
            } catch (Exception e) {
                log.debug("Error during Redis session cleanup: {}", e.getMessage());
            }
        }

        // Cleanup in-memory expired sessions
        LocalDateTime now = LocalDateTime.now();
        List<String> toRemove = new ArrayList<>();
        inMemorySessions.forEach((sId, data) -> {
            String expiresAtStr = (String) data.get("expiresAt");
            if (expiresAtStr != null) {
                try {
                    LocalDateTime expiresAt = LocalDateTime.parse(expiresAtStr, DATE_FORMATTER);
                    if (now.isAfter(expiresAt)) {
                        toRemove.add(sId);
                    }
                } catch (Exception ignored) {}
            }
        });
        toRemove.forEach(this::invalidateSession);
    }
}