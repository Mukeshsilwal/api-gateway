package com.ticketkatum.alertservice.dto;

import com.ticketkatum.alertservice.entity.AlertPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertPreferenceDTO {

    private Long preferenceId;
    private Long userId;
    private Boolean enablePush;
    private Boolean enableEmail;
    private Boolean enableSms;
    private Boolean enableWebsocket;
    private String alertTypes; // JSON string
    private LocalTime quietHoursStart;
    private LocalTime quietHoursEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AlertPreferenceDTO fromEntity(AlertPreference preference) {
        if (preference == null) {
            return null;
        }

        return AlertPreferenceDTO.builder()
                .preferenceId(preference.getPreferenceId())
                .userId(preference.getUserId())
                .enablePush(preference.getEnablePush())
                .enableEmail(preference.getEnableEmail())
                .enableSms(preference.getEnableSms())
                .enableWebsocket(preference.getEnableWebsocket())
                .alertTypes(preference.getAlertTypes())
                .quietHoursStart(preference.getQuietHoursStart())
                .quietHoursEnd(preference.getQuietHoursEnd())
                .createdAt(preference.getCreatedAt())
                .updatedAt(preference.getUpdatedAt())
                .build();
    }
}
