package com.ticketkatum.dto.guide;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideDTO {

    private Long guideId;
    private Long userId;
    private String fullName;
    private String licenseNumber;
    private Integer yearsExperience;
    private String bio;
    private String profileImageUrl;
    private String verificationStatus;
    private BigDecimal rating;
    private Integer reviewCount;
    private Boolean isActive;
    private String rejectionReason;
    private Long verifiedBy;
    private String verifiedAt;

    // Additional fields for creation/update
    private List<String> specialties;
    private List<String> languages;
}
