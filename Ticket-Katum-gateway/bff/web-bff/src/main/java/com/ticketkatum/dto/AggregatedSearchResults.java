package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedSearchResults {
    private List<EnrichedHotelDTO> hotels;
    private int totalResults;
    private Map<String, Object> appliedFilters;
    private PriceRange priceRange;
    private List<String> availableCities;
    private List<HotelRecommendation> recommendations;
    private List<HotelRecommendation> nearbyHotels;
    private Map<String, Object> searchMetadata;
}