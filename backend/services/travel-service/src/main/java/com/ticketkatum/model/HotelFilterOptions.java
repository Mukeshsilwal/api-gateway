package com.ticketkatum.model;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelFilterOptions {
    private List<String> cities;
    private List<Integer> starRatings; // [3, 4, 5]
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<String> availableAmenities;
}
