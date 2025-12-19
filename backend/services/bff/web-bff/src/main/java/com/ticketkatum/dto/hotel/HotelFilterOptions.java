package com.ticketkatum.dto.hotel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelFilterOptions {

    private String location;            // e.g., Kathmandu, Pokhara, Lakeside
    private Double latitude;
    private Double longitude;

    private Double radiusInKm;          // For “nearby hotels” filtering

    private Double minPrice;            // Minimum room price
    private Double maxPrice;            // Maximum room price

    private Integer minRating;          // 1–5 star rating
    private Integer maxRating;

    private Boolean hasWifi;
    private Boolean hasParking;
    private Boolean hasRestaurant;
    private Boolean hasPool;
    private Boolean hasAC;
    private Boolean hasBreakfast;

    private String sortBy;              // price, rating, distance, popularity
    private String sortDirection;       // ASC / DESC

    private Integer pageNumber;         // for pagination
    private Integer pageSize;
}
