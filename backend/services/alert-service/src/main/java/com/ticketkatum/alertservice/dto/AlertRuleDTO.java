package com.ticketkatum.alertservice.dto;

import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.entity.AlertRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleDTO {

    private Long ruleId;
    private String name;
    private String description;
    private String alertType;
    private String conditions; // JSON string
    private String severity;
    private List<String> channels;
    private String templateId;
    private Boolean isActive;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AlertRuleDTO fromEntity(AlertRule rule) {
        if (rule == null) {
            return null;
        }

        return AlertRuleDTO.builder()
                .ruleId(rule.getRuleId())
                .name(rule.getName())
                .description(rule.getDescription())
                .alertType(rule.getAlertType().name())
                .conditions(rule.getConditions())
                .severity(rule.getSeverity().name())
                .channels(rule.getChannels())
                .templateId(rule.getTemplateId())
                .isActive(rule.getIsActive())
                .priority(rule.getPriority())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
