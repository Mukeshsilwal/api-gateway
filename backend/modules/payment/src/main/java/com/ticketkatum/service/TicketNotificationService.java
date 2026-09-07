package com.ticketkatum.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class TicketNotificationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic ticketUpdatesTopic;
    private final ObjectMapper objectMapper;

    public TicketNotificationService(
            @Qualifier("customRedisTemplate") RedisTemplate<String, Object> redisTemplate,
            @Qualifier("ticketUpdatesTopic") ChannelTopic ticketUpdatesTopic,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.ticketUpdatesTopic = ticketUpdatesTopic;
        this.objectMapper = objectMapper;
    }

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
        } catch (Exception e) {
            log.warn("Unable to publish ticket update to Redis (service offline): {}", e.getMessage());
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
