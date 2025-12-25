package com.ticketkatum.alertservice.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.alertservice.dto.AlertDTO;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.repository.AlertRepository;
import com.ticketkatum.alertservice.service.NotificationDeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertDeliveryConsumer {

    private final NotificationDeliveryService notificationDeliveryService;
    private final AlertRepository alertRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "alert-events", groupId = "alert-service-delivery")
    public void handleAlertEvent(String message) {
        log.debug("Received alert event for delivery: {}", message);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);
            
            String eventType = (String) payload.get("eventType");
            
            if ("alert.created".equals(eventType)) {
                processAlertCreated(payload);
            }
            
        } catch (Exception e) {
            log.error("Failed to process alert event delivery: {}", message, e);
        }
    }

    private void processAlertCreated(Map<String, Object> payload) {
        try {
            // We need to fetch the full alert entity to pass to delivery service (for logging etc)
            // Payload might contain limited info. 
            // Ideally payload has alertId.
            Object alertIdObj = payload.get("alertId");
            Long alertId = null;
            if (alertIdObj instanceof Integer) {
                 alertId = ((Integer) alertIdObj).longValue();
            } else if (alertIdObj instanceof Long) {
                 alertId = (Long) alertIdObj;
            } else if (alertIdObj instanceof String) {
                 alertId = Long.parseLong((String) alertIdObj);
            }

            if (alertId != null) {
                Alert alertEntity = alertRepository.findById(alertId).orElse(null);
                if (alertEntity != null) {
                    // Create DTO from entity or use payload if sufficient. 
                    // Using entity to ensure latest state.
                    AlertDTO alertDTO = AlertDTO.fromEntity(alertEntity);
                    
                    notificationDeliveryService.deliverAlert(alertDTO, alertEntity);
                } else {
                    log.warn("Alert entity not found for delivery: {}", alertId);
                }
            } else {
                log.warn("Alert ID missing in event payload: {}", payload);
            }

        } catch (Exception e) {
            log.error("Error processing alert created event", e);
        }
    }
}
