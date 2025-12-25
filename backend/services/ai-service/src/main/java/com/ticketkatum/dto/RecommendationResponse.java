package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private String title;
    private String description;
    private List<TripSuggestion> suggestions;
    private String aiAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TripSuggestion {
        private String name;
        private String type; // "DESTINATION", "ACTIVITY", "HOTEL"
        private String description;
        private String estimatedCost;
        private String location;
    }
}
