package com.ticketkatum.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@AllArgsConstructor
@Slf4j
public class TicketNotificationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic ticketUpdatesTopic;
    private final ObjectMapper objectMapper;

    public void publishTicketUpdate(Long ticketId, String updateType, Object data) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("ticketId", ticketId);
            message.put("updateType", updateType);
            message.put("data", data);
            message.put("timestamp", System.currentTimeMillis());

            String jsonMessage = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(ticketUpdatesTopic.getTopic(), jsonMessage);

            log.info("Published update for ticket {}: {}", ticketId, updateType);
        } catch (JsonProcessingException e) {
            log.error("Error publishing ticket update", e);
        }
    }

    public void notifyTicketAssigned(Long ticketId, Long agentId) {
        publishTicketUpdate(ticketId, "ASSIGNED",
                Map.of("agentId", agentId));
    }

    public void notifyTicketStatusChanged(Long ticketId, String newStatus) {
        publishTicketUpdate(ticketId, "STATUS_CHANGED",
                Map.of("status", newStatus));
    }
}
