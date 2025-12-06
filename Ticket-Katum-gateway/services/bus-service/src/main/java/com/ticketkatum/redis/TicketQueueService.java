package com.ticketkatum.redis;

import com.ticketkatum.enums.Priority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketQueueService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String QUEUE_KEY = "ticket:queue";

    public void enqueueTicket(Long ticketId, Priority priority) {
        redisTemplate.opsForZSet()
                .add(QUEUE_KEY, ticketId.toString(), priority.getValue());
        log.info("Enqueued ticket {} with priority {}", ticketId, priority);
    }

    public String dequeueTicket() {
        Set<ZSetOperations.TypedTuple<Object>> result =
                Collections.singleton(redisTemplate.opsForZSet().popMin(QUEUE_KEY));

        if (result != null && !result.isEmpty()) {
            String ticketId = (String) result.iterator().next().getValue();
            log.info("Dequeued ticket: {}", ticketId);
            return ticketId;
        }
        return null;
    }

    public Long getQueueSize() {
        return redisTemplate.opsForZSet().size(QUEUE_KEY);
    }

    public Set<Object> getTopTickets(int count) {
        return redisTemplate.opsForZSet().range(QUEUE_KEY, 0, count - 1);
    }

    public void removeFromQueue(Long ticketId) {
        redisTemplate.opsForZSet().remove(QUEUE_KEY, ticketId.toString());
    }
}