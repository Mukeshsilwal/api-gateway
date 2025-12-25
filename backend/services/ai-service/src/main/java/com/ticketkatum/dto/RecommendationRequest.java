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
public class RecommendationRequest {
    private String userId;
    private String destination;
    private List<String> interests;
    private String budgetRange; // e.g., "Low", "Medium", "High"
    private String travelType; // e.g., "Solo", "Family", "Couple"
    private String duration; // e.g., "3 days"
    private String season; // e.g., "Spring", "Monsoon"
}
