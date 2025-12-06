package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDetailResponse {
    private Long hotelId;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Integer starRating;
    private Double averageRating;
    private Integer totalReviews;
    private List<String> amenities;
    private List<String> images;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String phoneNumber;
    private String email;
    private String website;
    private Boolean featured;
    private HotelAvailabilityResponse availability;
    private List<RoomTypeInfo> roomTypes;
}
