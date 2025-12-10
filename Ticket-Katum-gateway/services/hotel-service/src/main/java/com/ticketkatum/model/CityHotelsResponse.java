package com.ticketkatum.model;

import lombok.*;

import java.util.List;

/**
 * City search response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityHotelsResponse {
    private String city;
    private Integer totalHotels;
    private List<HotelRecommendation> hotels;
    private Integer page;
    private Integer totalPages;
}