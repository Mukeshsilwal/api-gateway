package com.ticketkatum.sos.service;

import com.ticketkatum.sos.dto.ContactRequest;
import com.ticketkatum.sos.dto.SOSRequest;
import com.ticketkatum.sos.dto.SOSResponse;
import com.ticketkatum.sos.dto.SafetyStatusRequest;
import com.ticketkatum.sos.entity.EmergencyAlert;
import com.ticketkatum.sos.entity.EmergencyContact;
import com.ticketkatum.sos.entity.SafetyStatus;
import com.ticketkatum.sos.repository.EmergencyAlertRepository;
import com.ticketkatum.sos.repository.EmergencyContactRepository;
import com.ticketkatum.sos.repository.SafetyStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SosService {

    private final EmergencyAlertRepository emergencyAlertRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final SafetyStatusRepository safetyStatusRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String ALERT_TOPIC = "alert-events";
    private static final String TRACKING_TOPIC = "tracking-events";

    public SOSResponse triggerSos(SOSRequest request) {
        log.info("Triggering SOS for user: {}", request.getUserId());

        EmergencyAlert alert = EmergencyAlert.builder()
                .userId(request.getUserId())
                .tripId(request.getTripId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(EmergencyAlert.AlertStatus.TRIGGERED)
                .description(request.getDescription())
                .batteryLevel(request.getBatteryLevel())
                .signalStrength(request.getSignalStrength())
                .triggeredAt(LocalDateTime.now())
                .build();

        EmergencyAlert savedAlert = emergencyAlertRepository.save(alert);

        // Publish event to Alert Service for notification dispatch
        publishEmergencyEvent("EMERGENCY_SOS", savedAlert);

        // Publish event to Tracking Service for high-frequency tracking
        publishTrackingEvent(savedAlert);

        // Push real-time update to admin dashboard
        messagingTemplate.convertAndSend("/topic/emergency", SOSResponse.fromEntity(savedAlert));

        // Update user safety status to DANGER
        updateSafetyStatus(SafetyStatusRequest.builder()
                .userId(request.getUserId())
                .status(SafetyStatus.Status.DANGER)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .notes("SOS Triggered")
                .build());

        return SOSResponse.fromEntity(savedAlert);
    }

    public SOSResponse resolveSos(Long alertId, Long resolvedBy) {
        log.info("Resolving SOS alert: {}", alertId);
        EmergencyAlert alert = emergencyAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setStatus(EmergencyAlert.AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedBy);

        EmergencyAlert savedAlert = emergencyAlertRepository.save(alert);
        
        publishEmergencyEvent("SOS_RESOLVED", savedAlert);
        
        // Push real-time update to admin dashboard
        messagingTemplate.convertAndSend("/topic/emergency", SOSResponse.fromEntity(savedAlert));

        // Update safety status if this was the last active alert for the user
        updateSafetyStatus(SafetyStatusRequest.builder()
                .userId(alert.getUserId())
                .status(SafetyStatus.Status.SAFE)
                .notes("SOS Resolved")
                .build());

        return SOSResponse.fromEntity(savedAlert);
    }

    public EmergencyContact addContact(ContactRequest request) {
        log.info("Adding emergency contact for user: {}", request.getUserId());
        EmergencyContact contact = EmergencyContact.builder()
                .userId(request.getUserId())
                .name(request.getName())
                .relationship(request.getRelationship())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return emergencyContactRepository.save(contact);
    }

    public List<EmergencyContact> getContacts(Long userId) {
        return emergencyContactRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public void deleteContact(Long contactId) {
        emergencyContactRepository.deleteById(contactId);
    }

    public SafetyStatus updateSafetyStatus(SafetyStatusRequest request) {
        log.info("Updating safety status for user: {}", request.getUserId());
        SafetyStatus status = safetyStatusRepository.findByUserId(request.getUserId())
                .orElse(SafetyStatus.builder()
                        .userId(request.getUserId())
                        .build());

        status.setStatus(request.getStatus());
        status.setLastCheckIn(LocalDateTime.now());
        status.setLocationLat(request.getLatitude());
        status.setLocationLon(request.getLongitude());
        if (request.getNotes() != null) {
            status.setNotes(request.getNotes());
        }
        status.setUpdatedAt(LocalDateTime.now());

        return safetyStatusRepository.save(status);
    }

    public SafetyStatus getSafetyStatus(Long userId) {
        return safetyStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Safety status not found for user"));
    }

    private void publishEmergencyEvent(String eventType, EmergencyAlert alert) {
        try {
            Map<String, Object> payload = Map.of(
                    // Pass ID clearly
            );

            kafkaTemplate.send(ALERT_TOPIC, alert.getAlertId().toString(), payload);
            log.info("Published emergency event: {}", eventType);
        } catch (Exception e) {
            log.error("Failed to publish emergency event", e);
        }
    }

    private void publishTrackingEvent(EmergencyAlert alert) {
        try {
            Map<String, Object> payload = Map.of(
                    "eventType", "TRACKING_MODE_UPDATE",
                    "userId", alert.getUserId(),
                    "tripId", alert.getTripId() != null ? alert.getTripId() : "null",
                    "mode", "HIGH_FREQUENCY",
                    "reason", "SOS_TRIGGERED",
                    "timestamp", LocalDateTime.now().toString()
            );

            kafkaTemplate.send(TRACKING_TOPIC, alert.getUserId().toString(), payload);
            log.info("Published tracking event: HIGH_FREQUENCY");
        } catch (Exception e) {
            log.error("Failed to publish tracking event", e);
        }
    }
}
