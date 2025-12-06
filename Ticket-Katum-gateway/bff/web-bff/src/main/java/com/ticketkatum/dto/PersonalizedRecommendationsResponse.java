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
public class PersonalizedRecommendationsResponse {
    private List<HotelRecommendation> hotels;
    private List<MovieRecommendation> movies;
    private LocationInfo location;
    private String recommendationReason;
    private LocalDateTime timestamp;
}