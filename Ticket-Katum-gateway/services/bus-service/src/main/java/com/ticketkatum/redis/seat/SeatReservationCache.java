package com.ticketkatum.redis.seat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatReservationCache {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String RESERVED_SEATS_KEY = "seats:reserved:";
    private static final String SEAT_STATUS_KEY = "seat:status:";

    public void markSeatAsReserved(long seatId, long bookingId) {
        String key = RESERVED_SEATS_KEY + bookingId;
        redisTemplate.opsForSet().add(key, seatId);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);

        // Cache seat status
        String statusKey = SEAT_STATUS_KEY + seatId;
        redisTemplate.opsForValue().set(statusKey, "RESERVED", 1, TimeUnit.HOURS);

        log.info("Marked seat {} as reserved for booking {}", seatId, bookingId);
    }

    public void markSeatAsAvailable(long seatId) {
        String statusKey = SEAT_STATUS_KEY + seatId;
        redisTemplate.opsForValue().set(statusKey, "AVAILABLE", 1, TimeUnit.HOURS);
        log.info("Marked seat {} as available", seatId);
    }

    public boolean isSeatReservedInCache(long seatId) {
        String statusKey = SEAT_STATUS_KEY + seatId;
        Object status = redisTemplate.opsForValue().get(statusKey);
        return "RESERVED".equals(status);
    }

    public Set<Object> getReservedSeatsForBooking(long bookingId) {
        String key = RESERVED_SEATS_KEY + bookingId;
        return redisTemplate.opsForSet().members(key);
    }

    public void clearSeatReservation(long seatId, long bookingId) {
        String key = RESERVED_SEATS_KEY + bookingId;
        redisTemplate.opsForSet().remove(key, seatId);
        markSeatAsAvailable(seatId);
    }
}