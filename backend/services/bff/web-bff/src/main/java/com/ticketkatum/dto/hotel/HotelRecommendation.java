package com.ticketkatum.dto.hotel;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelRecommendation {
    // Basic info
    private Long hotelId;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private String zipCode;

    // Location
    private Double latitude;
    private Double longitude;

    // Distance from search location
    private Double distanceKm;
    private String distanceLabel; // "1.2 km away"

    // Hotel details
    private Integer starRating; // 1-5
    private Double averageRating; // 0.00 to 5.00
    private Integer totalReviews;
    private List<String> amenities;
    private List<String> images;

    // Pricing
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String priceLabel; // "From NPR 5,000/night"

    // Availability
    private Boolean available;
    private Integer availableRooms;

    // Recommendation score (0-100)
    private Double recommendationScore;

    // Contact info
    private String phoneNumber;
    private String email;
    private String website;

    // Status
    private Boolean featured;
    private Boolean active;
}
