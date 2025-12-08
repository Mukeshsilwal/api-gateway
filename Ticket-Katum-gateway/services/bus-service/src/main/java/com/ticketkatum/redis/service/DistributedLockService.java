package com.ticketkatum.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DistributedLockService {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;

    public boolean acquireLock(String lockKey, String lockValue, long timeoutSeconds) {
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, timeoutSeconds, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(acquired);
    }

    public void releaseLock(String lockKey, String lockValue) {
        Object currentValue = redisTemplate.opsForValue().get(lockKey);
        if (lockValue.equals(currentValue)) {
            redisTemplate.delete(lockKey);
        }
    }

    public boolean acquireTicketLock(Long ticketId, Long agentId) {
        String lockKey = "lock:ticket:" + ticketId;
        return acquireLock(lockKey, agentId.toString(), 300);
    }

    public void releaseTicketLock(Long ticketId, Long agentId) {
        String lockKey = "lock:ticket:" + ticketId;
        releaseLock(lockKey, agentId.toString());
    }
}
