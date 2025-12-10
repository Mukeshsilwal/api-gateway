package com.ticketkatum.redis.booking;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingStatsService {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String STATS_KEY = "booking:stats:";

    public void incrementTotalBookings() {
        redisTemplate.opsForValue().increment(STATS_KEY + "total");
    }

    public void incrementSuccessfulBookings() {
        redisTemplate.opsForValue().increment(STATS_KEY + "successful");
    }

    public void incrementFailedBookings() {
        redisTemplate.opsForValue().increment(STATS_KEY + "failed");
    }

    public Long getTotalBookings() {
        Object value = redisTemplate.opsForValue().get(STATS_KEY + "total");
        return value != null ? Long.parseLong(value.toString()) : 0L;
    }

    public Long getSuccessfulBookings() {
        Object value = redisTemplate.opsForValue().get(STATS_KEY + "successful");
        return value != null ? Long.parseLong(value.toString()) : 0L;
    }
}