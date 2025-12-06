package com.ticketkatum.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturedHotelsResponse {
    private List<HotelRecommendation> hotels;
    private Integer totalFeatured;
    private String message;
}
