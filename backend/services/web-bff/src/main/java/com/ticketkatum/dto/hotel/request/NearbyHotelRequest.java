package com.ticketkatum.dto.hotel.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;


/**
 * Request DTO for finding nearby hotels
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyHotelRequest {

    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double longitude;

    // Radius in kilometers (default: 10km)
    @Min(value = 1, message = "Radius must be at least 1 km")
    @Max(value = 100, message = "Radius cannot exceed 100 km")
    private Double radiusKm = 10.0;

    // Optional filters
    private Integer minStarRating; // 1-5
    private BigDecimal maxPrice;
    private List<String> amenities; // Filter by amenities

    // Sorting
    private String sortBy = "distance"; // distance, price, rating

    // Pagination
    @Min(value = 1, message = "Page must be at least 1")
    private Integer page = 1;

    @Min(value = 1, message = "Limit must be at least 1")
    @Max(value = 50, message = "Limit cannot exceed 50")
    private Integer limit = 10;
}