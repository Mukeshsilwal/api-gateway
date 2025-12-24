package com.ticketkatum.dto.hotel.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelSearchRequest {
    private String city;
    private String searchQuery; // Hotel name or location
    private Double latitude;
    private Double longitude;
    private Integer minStarRating;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<String> amenities;

    @Builder.Default
    private String sortBy = "relevance"; // relevance, price, rating, distance

    @Min(value = 1)
    @Builder.Default
    private Integer page = 1;

    @Min(value = 1)
    @Max(value = 50)
    @Builder.Default
    private Integer limit = 10;
}
