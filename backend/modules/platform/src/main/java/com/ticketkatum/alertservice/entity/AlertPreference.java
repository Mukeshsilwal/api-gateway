package com.ticketkatum.alertservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalTime;
import java.util.Map;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_preferences", indexes = {
        @Index(name = "idx_preferences_user", columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AlertPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "enable_push")
    private Boolean enablePush = true;

    @Column(name = "enable_email")
    private Boolean enableEmail = true;

    @Column(name = "enable_sms")
    private Boolean enableSms = false;

    @Column(name = "enable_websocket")
    private Boolean enableWebsocket = true;

    // Stores preferences for specific alert types as JSON string
    // e.g. {"TRAFFIC_DELAY": true, "WEATHER": false}
    @Column(name = "alert_types", columnDefinition = "TEXT")
    private String alertTypes;

    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;

    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
