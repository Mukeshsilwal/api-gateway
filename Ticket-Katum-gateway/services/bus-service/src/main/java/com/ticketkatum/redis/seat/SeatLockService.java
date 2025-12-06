package com.ticketkatum.redis.seat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatLockService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String LOCK_KEY_PREFIX = "lock:seat:";
    private static final long LOCK_TIMEOUT = 300; // 5 minutes

    public String acquireSeatLock(long seatId) {
        String lockKey = LOCK_KEY_PREFIX + seatId;
        String lockValue = UUID.randomUUID().toString();

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, LOCK_TIMEOUT, TimeUnit.SECONDS);

        if (Boolean.TRUE.equals(acquired)) {
            log.info("Lock acquired for seat {} with value {}", seatId, lockValue);
            return lockValue;
        }

        log.warn("Failed to acquire lock for seat {}", seatId);
        return null;
    }

    public void releaseSeatLock(long seatId, String lockValue) {
        String lockKey = LOCK_KEY_PREFIX + seatId;
        Object currentValue = redisTemplate.opsForValue().get(lockKey);

        if (lockValue.equals(currentValue)) {
            redisTemplate.delete(lockKey);
            log.info("Lock released for seat {} with value {}", seatId, lockValue);
        } else {
            log.warn("Lock value mismatch for seat {}. Lock may have expired.", seatId);
        }
    }

    public boolean isSeatLocked(long seatId) {
        String lockKey = LOCK_KEY_PREFIX + seatId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(lockKey));
    }

    public void extendSeatLock(long seatId) {
        String lockKey = LOCK_KEY_PREFIX + seatId;
        redisTemplate.expire(lockKey, LOCK_TIMEOUT, TimeUnit.SECONDS);
    }
}