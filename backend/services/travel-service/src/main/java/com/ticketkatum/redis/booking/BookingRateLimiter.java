package com.ticketkatum.redis.booking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingRateLimiter {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String RATE_LIMIT_KEY = "ratelimit:booking:";

    public boolean isBookingAllowed(String userEmail, int maxBookings, int windowSeconds) {
        String key = RATE_LIMIT_KEY + userEmail;
        Long current = redisTemplate.opsForValue().increment(key);

        if (current == null) {
            return false;
        }

        if (current == 1) {
            redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
        }

        boolean allowed = current <= maxBookings;
        if (!allowed) {
            log.warn("Rate limit exceeded for user: {}", userEmail);
        }

        return allowed;
    }

    public boolean canCreateTicket(String userEmail) {
        // Allow 5 ticket bookings per minute
        return isBookingAllowed(userEmail, 5, 60);
    }

    public Long getRemainingBookings(String userEmail) {
        String key = RATE_LIMIT_KEY + userEmail;
        Long current = (Long) redisTemplate.opsForValue().get(key);
        return current == null ? 5L : Math.max(0, 5 - current);
    }
}