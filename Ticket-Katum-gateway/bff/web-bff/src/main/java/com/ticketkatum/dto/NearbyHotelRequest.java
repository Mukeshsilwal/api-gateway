package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyHotelRequest {
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private Integer minStarRating;
    private BigDecimal maxPrice;
    private String sortBy;
    private Integer page;
    private Integer limit;
}