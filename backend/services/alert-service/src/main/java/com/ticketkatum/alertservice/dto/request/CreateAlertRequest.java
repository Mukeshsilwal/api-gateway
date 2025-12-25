package com.ticketkatum.alertservice.dto.request;

import com.ticketkatum.alertservice.entity.Alert;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateAlertRequest {
    
    @NotNull(message = "Alert type is required")
    private Alert.AlertType alertType;
    
    @NotNull(message = "Severity is required")
    private Alert.Severity severity;
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
    
    private String affectedRegion;
    private String affectedRoutes;
    private String affectedDistricts;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal radiusKm;
    
    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;
    
    private LocalDateTime validUntil;
    private String source;
}
