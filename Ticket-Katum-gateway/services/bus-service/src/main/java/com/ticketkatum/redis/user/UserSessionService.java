package com.ticketkatum.redis.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String SESSION_KEY = "session:";
    private static final String USER_SESSIONS_KEY = "user:sessions:";
    private static final String ACTIVE_USERS_KEY = "users:active";
    private static final long SESSION_TIMEOUT = 86400; // 24 hours in seconds

    /**
     * Create a new session for user
     */
    public String createSession(String username, String token, Map<String, Object> additionalData) {
        String sessionId = UUID.randomUUID().toString();
        String sessionKey = SESSION_KEY + sessionId;

        // Build session data
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("username", username);
        sessionData.put("token", token);
        sessionData.put("sessionId", sessionId);
        sessionData.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        sessionData.put("lastAccessedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        sessionData.put("ipAddress", additionalData.getOrDefault("ipAddress", "unknown"));
        sessionData.put("userAgent", additionalData.getOrDefault("userAgent", "unknown"));
        sessionData.put("roles", additionalData.get("roles"));

        // Store session data as hash
        redisTemplate.opsForHash().putAll(sessionKey, sessionData);
        redisTemplate.expire(sessionKey, SESSION_TIMEOUT, TimeUnit.SECONDS);

        // Track user's active sessions
        String userSessionsKey = USER_SESSIONS_KEY + username;
        redisTemplate.opsForSet().add(userSessionsKey, sessionId);
        redisTemplate.expire(userSessionsKey, SESSION_TIMEOUT, TimeUnit.SECONDS);

        // Add to active users set
        redisTemplate.opsForSet().add(ACTIVE_USERS_KEY, username);

        log.info("Created session {} for user {}", sessionId, username);
        return sessionId;
    }

    /**
     * Get session data
     */
    public Map<Object, Object> getSession(String sessionId) {
        String sessionKey = SESSION_KEY + sessionId;
        Map<Object, Object> sessionData = redisTemplate.opsForHash().entries(sessionKey);

        if (!sessionData.isEmpty()) {
            // Update last accessed time
            sessionData.put("lastAccessedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            redisTemplate.opsForHash().put(sessionKey, "lastAccessedAt",
                    LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

            log.debug("Session {} accessed", sessionId);
        }

        return sessionData;
    }

    /**
     * Validate session and get username
     */
    public String validateSession(String sessionId) {
        String sessionKey = SESSION_KEY + sessionId;
        Object username = redisTemplate.opsForHash().get(sessionKey, "username");

        if (username != null) {
            extendSession(sessionId);
            return username.toString();
        }

        return null;
    }

    /**
     * Validate token matches session
     */
    public boolean validateTokenWithSession(String sessionId, String token) {
        String sessionKey = SESSION_KEY + sessionId;
        Object storedToken = redisTemplate.opsForHash().get(sessionKey, "token");
        return token.equals(storedToken);
    }

    /**
     * Extend session timeout
     */
    public void extendSession(String sessionId) {
        String sessionKey = SESSION_KEY + sessionId;
        redisTemplate.expire(sessionKey, SESSION_TIMEOUT, TimeUnit.SECONDS);
        log.debug("Extended session {}", sessionId);
    }

    /**
     * Invalidate specific session (logout)
     */
    public void invalidateSession(String sessionId) {
        String sessionKey = SESSION_KEY + sessionId;

        // Get username before deleting
        Object username = redisTemplate.opsForHash().get(sessionKey, "username");

        // Delete session
        redisTemplate.delete(sessionKey);

        if (username != null) {
            // Remove from user's sessions
            String userSessionsKey = USER_SESSIONS_KEY + username.toString();
            redisTemplate.opsForSet().remove(userSessionsKey, sessionId);

            // Check if user has other active sessions
            Long remainingSessions = redisTemplate.opsForSet().size(userSessionsKey);
            if (remainingSessions != null && remainingSessions == 0) {
                // Remove from active users if no sessions remain
                redisTemplate.opsForSet().remove(ACTIVE_USERS_KEY, username.toString());
            }
        }

        log.info("Invalidated session {}", sessionId);
    }

    /**
     * Invalidate all sessions for a user (logout from all devices)
     */
    public void invalidateAllUserSessions(String username) {
        String userSessionsKey = USER_SESSIONS_KEY + username;
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

        if (sessionIds != null) {
            for (Object sessionId : sessionIds) {
                String sessionKey = SESSION_KEY + sessionId.toString();
                redisTemplate.delete(sessionKey);
            }
        }

        // Remove user's sessions set
        redisTemplate.delete(userSessionsKey);

        // Remove from active users
        redisTemplate.opsForSet().remove(ACTIVE_USERS_KEY, username);

        log.info("Invalidated all sessions for user {}", username);
    }

    /**
     * Get all active sessions for a user
     */
    public List<Map<Object, Object>> getUserSessions(String username) {
        String userSessionsKey = USER_SESSIONS_KEY + username;
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

        List<Map<Object, Object>> sessions = new ArrayList<>();
        if (sessionIds != null) {
            for (Object sessionId : sessionIds) {
                String sessionKey = SESSION_KEY + sessionId.toString();
                Map<Object, Object> sessionData = redisTemplate.opsForHash().entries(sessionKey);
                if (!sessionData.isEmpty()) {
                    sessions.add(sessionData);
                }
            }
        }

        return sessions;
    }

    /**
     * Get count of active users
     */
    public Long getActiveUserCount() {
        return redisTemplate.opsForSet().size(ACTIVE_USERS_KEY);
    }

    /**
     * Get all active usernames
     */
    public Set<Object> getActiveUsers() {
        return redisTemplate.opsForSet().members(ACTIVE_USERS_KEY);
    }

    /**
     * Check if user is online
     */
    public boolean isUserOnline(String username) {
        return Boolean.TRUE.equals(
                redisTemplate.opsForSet().isMember(ACTIVE_USERS_KEY, username)
        );
    }

    /**
     * Update session data
     */
    public void updateSessionData(String sessionId, String key, Object value) {
        String sessionKey = SESSION_KEY + sessionId;
        redisTemplate.opsForHash().put(sessionKey, key, value);
        log.debug("Updated session {} data: {}={}", sessionId, key, value);
    }

    /**
     * Get session count for user (detect multiple devices)
     */
    public Long getUserSessionCount(String username) {
        String userSessionsKey = USER_SESSIONS_KEY + username;
        return redisTemplate.opsForSet().size(userSessionsKey);
    }
}

