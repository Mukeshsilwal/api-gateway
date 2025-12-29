package com.ticketkatum.alertservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.alertservice.dto.request.CreateAlertRequest;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.entity.AlertRule;
import com.ticketkatum.alertservice.repository.AlertRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertProcessingEngine {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertService alertService;
    private final ObjectMapper objectMapper;

    /**
     * Processes an incoming event and triggers alerts if rules are matched.
     *
     * @param eventType The type of event (e.g., "TRAFFIC_DELAY", "WEATHER_UPDATE")
     * @param payload   The event data map
     */
    @Async
    public void processEvent(String eventType, Map<String, Object> payload) {
        log.debug("Processing event of type: {}", eventType);

        try {
            // Find active rules relevant to this event
            // Mapping event types to AlertTypes might be needed, or we just check all active rules
            // For simplicity, let's say we fetch based on mapped type or just fetch all high priority ones
            List<AlertRule> rules = alertRuleRepository.findByIsActiveTrueOrderByPriorityDesc();

            for (AlertRule rule : rules) {
                if (matchesRule(rule, eventType, payload)) {
                    triggerAlert(rule, payload);
                }
            }

        } catch (Exception e) {
            log.error("Error processing event: {}", eventType, e);
        }
    }

    private boolean matchesRule(AlertRule rule, String eventType, Map<String, Object> payload) {
        // Basic matching logic: 
        // 1. Check if rule matches event type (if implied schema exists)
        // 2. Evaluate JSON conditions against payload
        
        // Simple mapping check for demo purposes
        if (!rule.getAlertType().name().equalsIgnoreCase(eventType) && 
            !eventType.contains(rule.getAlertType().name())) {
             return false;
        }

        try {
            if (rule.getConditions() == null || rule.getConditions().isEmpty() || rule.getConditions().equals("{}")) {
                return true; // No specific conditions, always match if type matches
            }

            JsonNode conditions = objectMapper.readTree(rule.getConditions());
            
            // Checking simple equality conditions
            // e.g. condition {"severity": "high"} checks if payload["severity"] == "high"
            boolean match = true;
            if (conditions.isObject()) {
                var fields = conditions.fields();
                while (fields.hasNext()) {
                    var entry = fields.next();
                    String key = entry.getKey();
                    JsonNode value = entry.getValue();
                    
                    if (!payload.containsKey(key)) {
                        match = false;
                        break;
                    }
                    
                    Object payloadVal = payload.get(key);
                    // Simple string comparison for now
                    if (!String.valueOf(payloadVal).equals(value.asText())) {
                         match = false;
                         break;
                    }
                }
            }
            return match;

        } catch (Exception e) {
            log.warn("Failed to evaluate rule conditions for rule {}: {}", rule.getRuleId(), e.getMessage());
            return false;
        }
    }

    private void triggerAlert(AlertRule rule, Map<String, Object> payload) {
        log.info("Rule matched: {} - Generating alert", rule.getName());

        CreateAlertRequest request = CreateAlertRequest.builder()
                .alertType(rule.getAlertType())
                .severity(rule.getSeverity()) // Use rule severity, or override from payload
                .title(rule.getName() + " Detected")
                .description(generateDescription(rule, payload))
                .affectedRegion((String) payload.getOrDefault("region", "General"))
                .affectedRoutes((String) payload.getOrDefault("route", null))
                .source("RuleEngine")
                .validFrom(LocalDateTime.now())
                // .validUntil() -> could be calculated
                .build();
        
        // Use system ID (e.g. 0L) for createdBy
        alertService.createAlert(request, 0L);
    }

    private String generateDescription(AlertRule rule, Map<String, Object> payload) {
        // Simple template substitution could happen here
        String template = rule.getDescription();
        if (template == null) return "Auto-generated alert based on rule: " + rule.getName();
        
        // Replace placeholders like {value} with payload values
        // For now, return rule description + payload summary
        return template + " (Event data: " + payload.toString() + ")";
    }
}
