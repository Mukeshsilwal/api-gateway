package com.ticketkatum.dto.hotel;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelRecommendation {

    private Long id;
    private String hotelCode;
    private String name;
    private String city;

    private Double latitude;
    private Double longitude;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private Double averageRating;
    private Double totalReviews;

    // distance from user (in KM)
    private Double distance;

    // First or primary image
    private String featuredImage;

    // Short description for cards
    private String shortDescription;
}
