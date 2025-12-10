package com.ticketkatum.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;

    public boolean isAllowed(String userId, int maxRequests, int windowSeconds) {
        String key = "ratelimit:user:" + userId;
        Long current = redisTemplate.opsForValue().increment(key);

        if (current == null) {
            return false;
        }

        if (current == 1) {
            redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
        }

        return current <= maxRequests;
    }

    public boolean isTicketCreationAllowed(String userId) {
        // Allow 10 tickets per hour
        return isAllowed(userId, 10, 3600);
    }

    public Long getRemainingRequests(String userId) {
        String key = "ratelimit:user:" + userId;
        Long current = (Long) redisTemplate.opsForValue().get(key);
        return current == null ? 10L : Math.max(0, 10 - current);
    }
}
