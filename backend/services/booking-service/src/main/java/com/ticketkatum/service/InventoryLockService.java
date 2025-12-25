package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import com.ticketkatum.common.service.SystemConfigService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Redis-based distributed inventory locking service.
 * Provides pessimistic locking for high-concurrency ticket booking scenarios.
 * 
 * Key Features:
 * - Distributed locks with TTL to prevent deadlocks
 * - Automatic lock release on booking completion
 * - Thread-safe inventory management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryLockService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SystemConfigService systemConfigService;

    private static final String LOCK_PREFIX = "inventory:lock:";
    private static final String INVENTORY_PREFIX = "inventory:available:";

    /**
     * Acquire a distributed lock for inventory.
     * 
     * @param eventId             Event ID
     * @param ticketTypeId        Ticket type ID
     * @param quantity            Quantity to lock
     * @param lockDurationSeconds Lock duration in seconds
     * @return Lock token if successful, null if lock cannot be acquired
     */
    public String acquireLock(Long eventId, Long ticketTypeId, Integer quantity, long lockDurationSeconds) {
        String lockKey = buildLockKey(eventId, ticketTypeId);
        String inventoryKey = buildInventoryKey(eventId, ticketTypeId);
        String lockToken = UUID.randomUUID().toString();

        log.debug("Attempting to acquire lock for eventId: {}, ticketTypeId: {}, quantity: {}",
                eventId, ticketTypeId, quantity);

        try {
            // Try to set lock with NX (only if not exists) and EX (expiry)
            Boolean lockAcquired = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, lockToken, Duration.ofSeconds(lockDurationSeconds));

            if (Boolean.TRUE.equals(lockAcquired)) {
                // Check if sufficient inventory is available
                String availableStr = redisTemplate.opsForValue().get(inventoryKey);
                Integer available = availableStr != null ? Integer.parseInt(availableStr) : null;

                if (available != null && available >= quantity) {
                    // Decrement inventory
                    Long newAvailable = redisTemplate.opsForValue().decrement(inventoryKey, quantity);

                    log.info(
                            "Lock acquired successfully: eventId={}, ticketTypeId={}, lockToken={}, remainingInventory={}",
                            eventId, ticketTypeId, lockToken, newAvailable);

                    return lockToken;
                } else {
                    // Insufficient inventory, release lock
                    releaseLock(eventId, ticketTypeId, lockToken);
                    log.warn("Insufficient inventory: eventId={}, ticketTypeId={}, available={}, requested={}",
                            eventId, ticketTypeId, available, quantity);
                    return null;
                }
            } else {
                log.warn("Lock already held by another process: eventId={}, ticketTypeId={}",
                        eventId, ticketTypeId);
                return null;
            }
        } catch (Exception e) {
            log.error("Error acquiring lock: eventId={}, ticketTypeId={}", eventId, ticketTypeId, e);
            return null;
        }
    }

    /**
     * Acquire a lock with default TTL (5 minutes).
     */
    public String acquireLock(Long eventId, Long ticketTypeId, Integer quantity) {
        long ttl = systemConfigService.getLong("INVENTORY_LOCK_TTL", 300L);
        return acquireLock(eventId, ticketTypeId, quantity, ttl);
    }

    /**
     * Release a distributed lock.
     * 
     * @param eventId      Event ID
     * @param ticketTypeId Ticket type ID
     * @param lockToken    Lock token received when acquiring the lock
     * @return true if lock was released, false otherwise
     */
    public boolean releaseLock(Long eventId, Long ticketTypeId, String lockToken) {
        String lockKey = buildLockKey(eventId, ticketTypeId);

        try {
            // Only release if the lock token matches (prevents releasing someone else's
            // lock)
            String currentToken = redisTemplate.opsForValue().get(lockKey);

            if (lockToken.equals(currentToken)) {
                Boolean deleted = redisTemplate.delete(lockKey);
                log.info("Lock released: eventId={}, ticketTypeId={}, lockToken={}",
                        eventId, ticketTypeId, lockToken);
                return Boolean.TRUE.equals(deleted);
            } else {
                log.warn("Lock token mismatch or lock already expired: eventId={}, ticketTypeId={}",
                        eventId, ticketTypeId);
                return false;
            }
        } catch (Exception e) {
            log.error("Error releasing lock: eventId={}, ticketTypeId={}", eventId, ticketTypeId, e);
            return false;
        }
    }

    /**
     * Restore inventory when booking fails or is cancelled.
     * 
     * @param eventId      Event ID
     * @param ticketTypeId Ticket type ID
     * @param quantity     Quantity to restore
     */
    public void restoreInventory(Long eventId, Long ticketTypeId, Integer quantity) {
        String inventoryKey = buildInventoryKey(eventId, ticketTypeId);

        try {
            Long newAvailable = redisTemplate.opsForValue().increment(inventoryKey, quantity);
            log.info("Inventory restored: eventId={}, ticketTypeId={}, quantity={}, newAvailable={}",
                    eventId, ticketTypeId, quantity, newAvailable);
        } catch (Exception e) {
            log.error("Error restoring inventory: eventId={}, ticketTypeId={}, quantity={}",
                    eventId, ticketTypeId, quantity, e);
        }
    }

    /**
     * Initialize inventory for a ticket type.
     * 
     * @param eventId       Event ID
     * @param ticketTypeId  Ticket type ID
     * @param totalQuantity Total available quantity
     * @param ttlSeconds    TTL for the inventory key (optional, for cache expiry)
     */
    public void initializeInventory(Long eventId, Long ticketTypeId, Integer totalQuantity, Long ttlSeconds) {
        String inventoryKey = buildInventoryKey(eventId, ticketTypeId);

        try {
            redisTemplate.opsForValue().set(inventoryKey, totalQuantity.toString());

            if (ttlSeconds != null && ttlSeconds > 0) {
                redisTemplate.expire(inventoryKey, ttlSeconds, TimeUnit.SECONDS);
            }

            log.info("Inventory initialized: eventId={}, ticketTypeId={}, quantity={}",
                    eventId, ticketTypeId, totalQuantity);
        } catch (Exception e) {
            log.error("Error initializing inventory: eventId={}, ticketTypeId={}",
                    eventId, ticketTypeId, e);
        }
    }

    /**
     * Get current available inventory.
     * 
     * @param eventId      Event ID
     * @param ticketTypeId Ticket type ID
     * @return Available quantity, or null if not found
     */
    public Integer getAvailableInventory(Long eventId, Long ticketTypeId) {
        String inventoryKey = buildInventoryKey(eventId, ticketTypeId);

        try {
            String availableStr = redisTemplate.opsForValue().get(inventoryKey);
            return availableStr != null ? Integer.parseInt(availableStr) : null;
        } catch (Exception e) {
            log.error("Error getting available inventory: eventId={}, ticketTypeId={}",
                    eventId, ticketTypeId, e);
            return null;
        }
    }

    /**
     * Extend lock TTL if booking process is taking longer than expected.
     * 
     * @param eventId           Event ID
     * @param ticketTypeId      Ticket type ID
     * @param lockToken         Lock token
     * @param additionalSeconds Additional seconds to extend
     * @return true if extended successfully
     */
    public boolean extendLock(Long eventId, Long ticketTypeId, String lockToken, long additionalSeconds) {
        String lockKey = buildLockKey(eventId, ticketTypeId);

        try {
            String currentToken = redisTemplate.opsForValue().get(lockKey);

            if (lockToken.equals(currentToken)) {
                Boolean extended = redisTemplate.expire(lockKey, additionalSeconds, TimeUnit.SECONDS);
                log.info("Lock extended: eventId={}, ticketTypeId={}, additionalSeconds={}",
                        eventId, ticketTypeId, additionalSeconds);
                return Boolean.TRUE.equals(extended);
            } else {
                log.warn("Cannot extend lock - token mismatch: eventId={}, ticketTypeId={}",
                        eventId, ticketTypeId);
                return false;
            }
        } catch (Exception e) {
            log.error("Error extending lock: eventId={}, ticketTypeId={}", eventId, ticketTypeId, e);
            return false;
        }
    }

    private String buildLockKey(Long eventId, Long ticketTypeId) {
        return LOCK_PREFIX + eventId + ":" + ticketTypeId;
    }

    private String buildInventoryKey(Long eventId, Long ticketTypeId) {
        return INVENTORY_PREFIX + eventId + ":" + ticketTypeId;
    }
}
