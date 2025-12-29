package com.ticketkatum.alertservice.service;

import com.ticketkatum.alertservice.dto.AlertDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts an alert to a specific user.
     *
     * @param userId The ID of the user to receive the alert.
     * @param alert  The alert data.
     */
    public void sendToUser(Long userId, AlertDTO alert) {
        try {
            // Destination: /user/{userId}/queue/alerts
            // Note: In a real scenario with Spring Security, convertAndSendToUser uses the principal name (username)
            // If using userId as principal, this works. Otherwise we might need to map userId -> username.
            // For now assuming we send to a specific topic subscribed by the user client.
            String destination = "/topic/user/" + userId + "/alerts";
            messagingTemplate.convertAndSend(destination, alert);
            log.debug("Sent alert {} via WebSocket to user {}", alert.getAlertId(), userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket alert to user {}", userId, e);
        }
    }

    /**
     * Broadcasts an alert to a general topic (e.g., all users in a region).
     *
     * @param topicSuffix The suffix for the topic (e.g., "region/kathmandu").
     * @param alert       The alert data.
     */
    public void broadcast(String topicSuffix, AlertDTO alert) {
        try {
            String destination = "/topic/alerts/" + topicSuffix;
            messagingTemplate.convertAndSend(destination, alert);
            log.debug("Broadcasted alert {} to {}", alert.getAlertId(), destination);
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket alert to {}", topicSuffix, e);
        }
    }
}
