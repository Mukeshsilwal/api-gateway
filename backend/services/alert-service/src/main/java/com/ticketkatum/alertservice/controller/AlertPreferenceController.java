package com.ticketkatum.alertservice.controller;

import com.ticketkatum.alertservice.dto.AlertPreferenceDTO;
import com.ticketkatum.alertservice.entity.AlertPreference;
import com.ticketkatum.alertservice.repository.AlertPreferenceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/alerts/preferences")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Alert Preferences", description = "APIs for managing user alert preferences")
public class AlertPreferenceController {

    private final AlertPreferenceRepository alertPreferenceRepository;

    public ResponseEntity<AlertPreferenceDTO> getPreferences(@PathVariable Long userId) {
        AlertPreferenceDTO dto = alertPreferenceRepository.findByUserId(userId)
                .map(AlertPreferenceDTO::fromEntity)
                .orElseGet(() -> AlertPreferenceDTO.builder()
                        .userId(userId)
                        .enablePush(true)
                        .enableEmail(true)
                        .enableWebsocket(true)
                        .enableSms(false)
                        .build());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update preferences", description = "Update alert preferences for a user")
    public ResponseEntity<AlertPreferenceDTO> updatePreferences(@PathVariable Long userId,
            @RequestBody AlertPreferenceDTO prefDto) {
        log.info("Updating preferences for user: {}", userId);

        AlertPreference preference = alertPreferenceRepository.findByUserId(userId)
                .orElse(AlertPreference.builder().userId(userId).createdAt(LocalDateTime.now()).build());

        preference.setEnablePush(prefDto.getEnablePush());
        preference.setEnableEmail(prefDto.getEnableEmail());
        preference.setEnableSms(prefDto.getEnableSms());
        preference.setEnableWebsocket(prefDto.getEnableWebsocket());
        preference.setAlertTypes(prefDto.getAlertTypes());
        preference.setQuietHoursStart(prefDto.getQuietHoursStart());
        preference.setQuietHoursEnd(prefDto.getQuietHoursEnd());
        preference.setUpdatedAt(LocalDateTime.now());

        AlertPreference saved = alertPreferenceRepository.save(preference);
        return ResponseEntity.ok(AlertPreferenceDTO.fromEntity(saved));
    }
}
