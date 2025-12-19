package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchCriteria {
    private String city;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer minStars;
    private Integer maxStars;
    private Double latitude;
    private Double longitude;
    private Double radius;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private List<String> amenities;
    private String sortBy;
    private Integer limit;
    private Integer offset;
}
