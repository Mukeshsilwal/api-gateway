package com.ticketkatum.redis.booking;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingNotificationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic bookingUpdatesTopic;
    private final ObjectMapper objectMapper;

    public void publishBookingCreated(long ticketId, long bookingId, long seatId) {
        Map<String, Object> message = new HashMap<>();
        message.put("eventType", "TICKET_CREATED");
        message.put("ticketId", ticketId);
        message.put("bookingId", bookingId);
        message.put("seatId", seatId);
        message.put("timestamp", System.currentTimeMillis());

        publishMessage(message);
    }

    public void publishBookingCancelled(long ticketId, long seatId) {
        Map<String, Object> message = new HashMap<>();
        message.put("eventType", "TICKET_CANCELLED");
        message.put("ticketId", ticketId);
        message.put("seatId", seatId);
        message.put("timestamp", System.currentTimeMillis());

        publishMessage(message);
    }

    public void publishBookingUpdated(long ticketId) {
        Map<String, Object> message = new HashMap<>();
        message.put("eventType", "TICKET_UPDATED");
        message.put("ticketId", ticketId);
        message.put("timestamp", System.currentTimeMillis());

        publishMessage(message);
    }

    private void publishMessage(Map<String, Object> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(bookingUpdatesTopic.getTopic(), jsonMessage);
            log.info("Published booking update: {}", message.get("eventType"));
        } catch (JsonProcessingException e) {
            log.error("Error publishing booking update", e);
        }
    }
}
