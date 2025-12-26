package com.ticketkatum.guide.dto;

import com.ticketkatum.guide.entity.Guide;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Full name is required")
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

    public static GuideDTO fromEntity(Guide guide, List<String> specialties, List<String> languages) {
        return GuideDTO.builder()
                .guideId(guide.getGuideId())
                .userId(guide.getUserId())
                .fullName(guide.getFullName())
                .licenseNumber(guide.getLicenseNumber())
                .yearsExperience(guide.getYearsExperience())
                .bio(guide.getBio())
                .profileImageUrl(guide.getProfileImageUrl())
                .verificationStatus(guide.getVerificationStatus().name())
                .rating(guide.getRating())
                .reviewCount(guide.getReviewCount())
                .isActive(guide.getIsActive())
                .rejectionReason(guide.getRejectionReason())
                .verifiedBy(guide.getVerifiedBy())
                .verifiedAt(guide.getVerifiedAt() != null ? guide.getVerifiedAt().toString() : null)
                .specialties(specialties)
                .languages(languages)
                .build();
    }
}
