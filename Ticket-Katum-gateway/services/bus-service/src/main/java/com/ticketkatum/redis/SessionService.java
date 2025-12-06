package com.ticketkatum.redis;


import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String SESSION_KEY = "session:";
    private static final long SESSION_TIMEOUT = 3600; // 1 hour

    public String createSession(Long userId, Map<String, Object> sessionData) {
        String sessionId = UUID.randomUUID().toString();
        String key = SESSION_KEY + sessionId;

        Map<String, Object> data = new HashMap<>(sessionData);
        data.put("userId", userId);
        data.put("createdAt", System.currentTimeMillis());

        redisTemplate.opsForHash().putAll(key, data);
        redisTemplate.expire(key, SESSION_TIMEOUT, TimeUnit.SECONDS);

        return sessionId;
    }

    public Map<Object, Object> getSession(String sessionId) {
        String key = SESSION_KEY + sessionId;
        return redisTemplate.opsForHash().entries(key);
    }

    public void extendSession(String sessionId) {
        String key = SESSION_KEY + sessionId;
        redisTemplate.expire(key, SESSION_TIMEOUT, TimeUnit.SECONDS);
    }

    public void invalidateSession(String sessionId) {
        String key = SESSION_KEY + sessionId;
        redisTemplate.delete(key);
    }
}
