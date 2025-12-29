package com.ticketkatum.guide.dto;

import com.ticketkatum.guide.entity.ServicePackage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackageDTO {

    private Long packageId;
    
    @NotNull(message = "Guide ID is required")
    private Long guideId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    
    @Positive(message = "Duration must be positive")
    private Integer durationHours;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private String currency;
    
    @Positive(message = "Max group size must be positive")
    private Integer maxGroupSize;
    
    private Boolean isActive;

    public static ServicePackageDTO fromEntity(ServicePackage pkg) {
        return ServicePackageDTO.builder()
                .packageId(pkg.getPackageId())
                .guideId(pkg.getGuide().getGuideId())
                .title(pkg.getTitle())
                .description(pkg.getDescription())
                .durationHours(pkg.getDurationHours())
                .price(pkg.getPrice())
                .currency(pkg.getCurrency())
                .maxGroupSize(pkg.getMaxGroupSize())
                .isActive(pkg.getIsActive())
                .build();
    }
}
