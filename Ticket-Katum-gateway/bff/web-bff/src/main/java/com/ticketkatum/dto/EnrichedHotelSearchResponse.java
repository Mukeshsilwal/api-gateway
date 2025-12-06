package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedHotelSearchResponse {
    private List<HotelRecommendation> hotels;
    private Integer totalResults;
    private Integer page;
    private Integer totalPages;
    private SearchLocation searchLocation;
    private SearchFilters filters;
    private LocalDateTime timestamp;
}
