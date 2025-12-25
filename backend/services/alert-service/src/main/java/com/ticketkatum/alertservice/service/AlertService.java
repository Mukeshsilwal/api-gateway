package com.ticketkatum.alertservice.service;

import com.ticketkatum.alertservice.dto.AlertDTO;
import com.ticketkatum.alertservice.dto.request.CreateAlertRequest;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AlertService {

    private final AlertRepository alertRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String ALERT_EVENTS_TOPIC = "alert-events";

    @Transactional
    @CacheEvict(value = "alerts", allEntries = true)
    public AlertDTO createAlert(CreateAlertRequest request, Long createdBy) {
        log.info("Creating alert: {} - {}", request.getAlertType(), request.getTitle());

        Alert alert = Alert.builder()
                .alertType(request.getAlertType())
                .severity(request.getSeverity())
                .title(request.getTitle())
                .description(request.getDescription())
                .affectedRegion(request.getAffectedRegion())
                .affectedRoutes(request.getAffectedRoutes())
                .affectedDistricts(request.getAffectedDistricts())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radiusKm(request.getRadiusKm())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .isActive(true)
                .source(request.getSource())
                .createdBy(createdBy)
                .build();

        Alert savedAlert = alertRepository.save(alert);
        log.info("Alert created successfully: {}", savedAlert.getAlertId());

        // Publish alert event
        publishAlertEvent("alert.created", savedAlert);

        return AlertDTO.fromEntity(savedAlert);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "alerts", key = "'active'")
    public List<AlertDTO> getActiveAlerts() {
        log.debug("Fetching active alerts");
        LocalDateTime now = LocalDateTime.now();
        List<Alert> alerts = alertRepository.findCurrentlyValidAlerts(now);
        return alerts.stream()
                .map(AlertDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsByRegion(String region) {
        log.debug("Fetching alerts for region: {}", region);
        LocalDateTime now = LocalDateTime.now();
        List<Alert> alerts = alertRepository.findActiveAlertsByRegion(region, now);
        return alerts.stream()
                .map(AlertDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsByRoute(String route) {
        log.debug("Fetching alerts for route: {}", route);
        LocalDateTime now = LocalDateTime.now();
        List<Alert> alerts = alertRepository.findActiveAlertsByRoute(route, now);
        return alerts.stream()
                .map(AlertDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsBySeverity(List<Alert.Severity> severities) {
        log.debug("Fetching alerts by severities: {}", severities);
        LocalDateTime now = LocalDateTime.now();
        List<Alert> alerts = alertRepository.findActiveAlertsBySeverities(severities, now);
        return alerts.stream()
                .map(AlertDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "alerts", allEntries = true)
    public AlertDTO resolveAlert(Long alertId) {
        log.info("Resolving alert: {}", alertId);

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        alert.setIsActive(false);
        alert.setValidUntil(LocalDateTime.now());

        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert resolved: {}", alertId);

        // Publish alert resolved event
        publishAlertEvent("alert.resolved", updatedAlert);

        return AlertDTO.fromEntity(updatedAlert);
    }

    private void publishAlertEvent(String eventType, Alert alert) {
        try {
            AlertEvent event = AlertEvent.builder()
                    .eventType(eventType)
                    .alertId(alert.getAlertId())
                    .alertType(alert.getAlertType().name())
                    .severity(alert.getSeverity().name())
                    .title(alert.getTitle())
                    .affectedRegion(alert.getAffectedRegion())
                    .affectedRoutes(alert.getAffectedRoutes())
                    .timestamp(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(ALERT_EVENTS_TOPIC, alert.getAlertId().toString(), event);
            log.info("Published {} event for alert: {}", eventType, alert.getAlertId());
        } catch (Exception e) {
            log.error("Failed to publish alert event: {}", eventType, e);
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AlertEvent {
        private String eventType;
        private Long alertId;
        private String alertType;
        private String severity;
        private String title;
        private String affectedRegion;
        private String affectedRoutes;
        private LocalDateTime timestamp;
    }
}
