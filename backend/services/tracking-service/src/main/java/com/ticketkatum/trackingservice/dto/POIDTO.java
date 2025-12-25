package com.ticketkatum.trackingservice.dto;

import com.ticketkatum.trackingservice.entity.PointOfInterest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POIDTO {
    
    private Long poiId;
    private String name;
    private String category;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private String contactNumber;
    private String region;
    private String district;
    private String description;
    private String openingHours;
    private String touristType;
    private BigDecimal rating;
    private Boolean isVerified;
    
    // Computed fields
    private Double distanceKm;
    
    public static POIDTO fromEntity(PointOfInterest poi) {
        if (poi == null) {
            return null;
        }
        
        return POIDTO.builder()
                .poiId(poi.getPoiId())
                .name(poi.getName())
                .category(poi.getCategory().name())
                .latitude(poi.getLatitude())
                .longitude(poi.getLongitude())
                .address(poi.getAddress())
                .contactNumber(poi.getContactNumber())
                .region(poi.getRegion())
                .district(poi.getDistrict())
                .description(poi.getDescription())
                .openingHours(poi.getOpeningHours())
                .touristType(poi.getTouristType().name())
                .rating(poi.getRating())
                .isVerified(poi.getIsVerified())
                .build();
    }
}
