package com.ticketkatum.model;

import lombok.*;

import java.util.List;

/**
 * Personalized recommendations response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizedRecommendationsResponse {
    private String userId;
    private List<HotelRecommendation> recommendations;
    private String recommendationBasis; // "Based on your location", "Based on your bookings", etc.
    private Integer totalRecommendations;
}
