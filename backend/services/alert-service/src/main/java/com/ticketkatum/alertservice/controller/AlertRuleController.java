package com.ticketkatum.alertservice.controller;

import com.ticketkatum.alertservice.dto.AlertRuleDTO;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.entity.AlertRule;
import com.ticketkatum.alertservice.repository.AlertRuleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts/rules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Alert Rules", description = "APIs for managing alert automation rules")
public class AlertRuleController {

    private final AlertRuleRepository alertRuleRepository;

    @GetMapping
    @Operation(summary = "Get all rules", description = "Retrieve all alert rules")
    public ResponseEntity<List<AlertRuleDTO>> getAllRules() {
        // In real app, might want pagination
        List<AlertRule> rules = alertRuleRepository.findAll();
        List<AlertRuleDTO> dtos = rules.stream()
                .map(AlertRuleDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Operation(summary = "Create rule", description = "Create a new alert rule")
    public ResponseEntity<AlertRuleDTO> createRule(@RequestBody AlertRuleDTO ruleDto) {
        log.info("Creating new alert rule: {}", ruleDto.getName());
        
        AlertRule rule = AlertRule.builder()
                .name(ruleDto.getName())
                .description(ruleDto.getDescription())
                .alertType(Alert.AlertType.valueOf(ruleDto.getAlertType()))
                .conditions(ruleDto.getConditions())
                .severity(Alert.Severity.valueOf(ruleDto.getSeverity()))
                .channels(ruleDto.getChannels()) // Assuming list of strings works with simple mapping
                .templateId(ruleDto.getTemplateId())
                .isActive(ruleDto.getIsActive() != null ? ruleDto.getIsActive() : true)
                .priority(ruleDto.getPriority() != null ? ruleDto.getPriority() : 0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        AlertRule savedRule = alertRuleRepository.save(rule);
        return ResponseEntity.ok(AlertRuleDTO.fromEntity(savedRule));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update rule", description = "Update an existing alert rule")
    public ResponseEntity<AlertRuleDTO> updateRule(@PathVariable Long id, @RequestBody AlertRuleDTO ruleDto) {
        log.info("Updating alert rule: {}", id);
        
        return alertRuleRepository.findById(id)
                .map(rule -> {
                    rule.setName(ruleDto.getName());
                    rule.setDescription(ruleDto.getDescription());
                    // Update other fields... simple set for now
                    if(ruleDto.getConditions() != null) rule.setConditions(ruleDto.getConditions());
                    rule.setUpdatedAt(LocalDateTime.now());
                    
                    AlertRule updated = alertRuleRepository.save(rule);
                    return ResponseEntity.ok(AlertRuleDTO.fromEntity(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete rule", description = "Delete an alert rule")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        log.info("Deleting alert rule: {}", id);
        if (alertRuleRepository.existsById(id)) {
            alertRuleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
