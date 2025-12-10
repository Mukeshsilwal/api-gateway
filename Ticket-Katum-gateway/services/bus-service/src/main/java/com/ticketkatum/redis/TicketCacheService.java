package com.ticketkatum.redis;

import com.ticketkatum.model.TicketDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketCacheService {

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String TICKET_KEY = "ticket:";
    private static final String BOOKING_TICKETS_KEY = "booking:tickets:";
    private static final long CACHE_TTL = 1; // 1 hour

    @Cacheable(value = "tickets", key = "#ticketId")
    public TicketDto getTicket(long ticketId) {
        String key = TICKET_KEY + ticketId;
        return (TicketDto) redisTemplate.opsForValue().get(key);
    }

    @CachePut(value = "tickets", key = "#ticketDto.ticketId")
    public TicketDto cacheTicket(TicketDto ticketDto) {
        String key = TICKET_KEY + ticketDto.getTicketNo();
        redisTemplate.opsForValue().set(key, ticketDto, CACHE_TTL, TimeUnit.HOURS);
        log.info("Cached ticket: {}", ticketDto.getTicketNo());
        return ticketDto;
    }

    @CacheEvict(value = "tickets", key = "#ticketId")
    public void evictTicket(long ticketId) {
        String key = TICKET_KEY + ticketId;
        redisTemplate.delete(key);
        log.info("Evicted ticket from cache: {}", ticketId);
    }

    // Cache booking tickets list
    public void cacheBookingTickets(long bookingId, List<TicketDto> tickets) {
        String key = BOOKING_TICKETS_KEY + bookingId;
        redisTemplate.opsForValue().set(key, tickets, 30, TimeUnit.MINUTES);
    }

    public List<TicketDto> getBookingTicketsFromCache(long bookingId) {
        String key = BOOKING_TICKETS_KEY + bookingId;
        return (List<TicketDto>) redisTemplate.opsForValue().get(key);
    }

    @CacheEvict(value = "bookingTickets", key = "#bookingId")
    public void evictBookingTickets(long bookingId) {
        String key = BOOKING_TICKETS_KEY + bookingId;
        redisTemplate.delete(key);
    }
}