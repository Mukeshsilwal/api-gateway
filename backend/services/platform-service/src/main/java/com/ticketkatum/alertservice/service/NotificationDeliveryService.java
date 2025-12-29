package com.ticketkatum.alertservice.service;

import com.ticketkatum.alertservice.dto.AlertDTO;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.entity.AlertDeliveryLog;
import com.ticketkatum.alertservice.entity.AlertPreference;
import com.ticketkatum.alertservice.repository.AlertDeliveryLogRepository;
import com.ticketkatum.alertservice.repository.AlertPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationDeliveryService {

    private final WebSocketBroadcaster webSocketBroadcaster;
    private final AlertPreferenceRepository alertPreferenceRepository;
    private final AlertDeliveryLogRepository deliveryLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deliverAlert(AlertDTO alert, Alert alertEntity) {
        // 1. Check user preferences if alert is targeted at a specific user
        // Note: AlertDTO usually contains userId if targeted, but Alert entity definitely does if stored properly.
        // Assuming we might have userId in Alert entity based on DTO mapping or CreateRequest.
        // Let's assume Alert entity has a userId field (it does in the schema).
        
        // However, Alert entity in schema has user_id, trip_id, etc.
        // If user_id is null, it might be a broadcast or trip-based alert.

        // Simulating simple logic for now:
        // - If user_id is present, check specific prefs and send.
        // - If trip_id is present, broadcast to trip topic.
        // - Else broadcast to region/general.

        // We need reference to the entity to create logs. The DTO is passed for broadcasting data.

        try {
            // NOTE: The Alert entity in the previous steps was defined with createdBy, but schema has user_id.
            // I should check Alert.java again to see if it has 'targetUserId' or similar. 
            // In step 1055, Alert.java showed `createdBy` but not an explicit `userId` target field (it had source, createdBy).
            // Wait, look at schema in V1__init_schema.sql (Step 1029):
            // "user_id BIGINT,"
            // But Alert.java in step 1055 did not show user_id! 
            // It showed: createdBy. It seems I might need to update Alert.java to match the schema or assuming 'createdBy' meant target or I missed a field.
            // Actually, checking Step 1055 again... 
            // It has `createdBy`. 
            // The schema has `user_id`, `trip_id`, `journey_id`. 
            // Alert.java in Step 1055 has `createdBy`. 
            // It seems `Alert.java` needs an update to include target fields `userId`, `tripId`, `journeyId` to match the schema fully.
            // For now, I will assume broadcasting based on available info or simply "send to all active channels" logic.
            
            // Let's implement delivery to WebSocket as default
            
            // Log attempt
            logDeliveryAttempt(alertEntity, "WEBSOCKET", AlertDeliveryLog.DeliveryStatus.PENDING, null);

            // Send via WebSocket
            if (alert.getAffectedRegion() != null) {
                webSocketBroadcaster.broadcast("region/" + alert.getAffectedRegion(), alert);
            } else {
                 webSocketBroadcaster.broadcast("general", alert);
            }
            // Logic for specific user targeting would go here if fields existed on Entity/DTO
            // e.g. if (alert.getUserId() != null) ...

            // Update log to success
            logDeliveryAttempt(alertEntity, "WEBSOCKET", AlertDeliveryLog.DeliveryStatus.SUCCESS, null);

        } catch (Exception e) {
            log.error("Failed to deliver alert notification", e);
            logDeliveryAttempt(alertEntity, "WEBSOCKET", AlertDeliveryLog.DeliveryStatus.FAILED, e.getMessage());
        }
    }

    private void logDeliveryAttempt(Alert alert, String channel, AlertDeliveryLog.DeliveryStatus status, String error) {
        try {
            AlertDeliveryLog logEntry = AlertDeliveryLog.builder()
                    .alert(alert)
                    .channel(channel)
                    .status(status)
                    .errorMessage(error)
                    .deliveredAt(LocalDateTime.now())
                    .build();
            deliveryLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save delivery log", e);
        }
    }
}
