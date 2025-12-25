package com.ticketkatum.alertservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ticketkatum.alertservice.converter.StringListConverter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "alert_rules", indexes = {
        @Index(name = "idx_rules_type", columnList = "alert_type"),
        @Index(name = "idx_rules_active", columnList = "is_active"),
        @Index(name = "idx_rules_priority", columnList = "priority")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private Alert.AlertType alertType;

    @Column(name = "conditions", nullable = false, columnDefinition = "TEXT")
    // Storing as JSON string for now, could be improved with a custom converter or
    // JSONB type if using specific dialect extensions
    private String conditions;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Alert.Severity severity;

    @Column(name = "channels", columnDefinition = "TEXT[]")
    @Convert(converter = StringListConverter.class) // Assuming we might need a converter or use simple array mapping
    private List<String> channels;

    @Column(name = "template_id")
    private String templateId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "priority")
    private Integer priority = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
