package com.ticketkatum.alertservice.dto;

import com.ticketkatum.alertservice.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    
    private Long alertId;
    private String alertType;
    private String severity;
    private String title;
    private String description;
    private String affectedRegion;
    private String affectedRoutes;
    private String affectedDistricts;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal radiusKm;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Boolean isActive;
    private String source;
    private LocalDateTime createdAt;
    
    // Computed fields
    private Boolean isCurrentlyValid;
    private Long minutesUntilExpiry;
    
    public static AlertDTO fromEntity(Alert alert) {
        if (alert == null) {
            return null;
        }
        
        AlertDTO dto = AlertDTO.builder()
                .alertId(alert.getAlertId())
                .alertType(alert.getAlertType().name())
                .severity(alert.getSeverity().name())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .affectedRegion(alert.getAffectedRegion())
                .affectedRoutes(alert.getAffectedRoutes())
                .affectedDistricts(alert.getAffectedDistricts())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .radiusKm(alert.getRadiusKm())
                .validFrom(alert.getValidFrom())
                .validUntil(alert.getValidUntil())
                .isActive(alert.getIsActive())
                .source(alert.getSource())
                .createdAt(alert.getCreatedAt())
                .build();
        
        // Computed fields
        dto.setIsCurrentlyValid(alert.isCurrentlyValid());
        
        if (alert.getValidUntil() != null) {
            long minutes = java.time.Duration.between(
                    LocalDateTime.now(), 
                    alert.getValidUntil()
            ).toMinutes();
            dto.setMinutesUntilExpiry(minutes > 0 ? minutes : 0);
        }
        
        return dto;
    }
}
