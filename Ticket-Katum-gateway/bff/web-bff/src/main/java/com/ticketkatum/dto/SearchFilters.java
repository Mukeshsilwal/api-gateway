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
public class SearchFilters {
    private Integer minStarRating;
    private BigDecimal maxPrice;
    private Double radiusKm;
    private String sortBy;
}