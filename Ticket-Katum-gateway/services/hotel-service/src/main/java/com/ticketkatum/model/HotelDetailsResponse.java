package com.ticketkatum.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDetailsResponse {
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

    private String phoneNumber;
    private String email;
    private String website;

    private List<RoomTypeInfo> roomTypes;
    private List<ReviewSummary> recentReviews;

    private Boolean featured;
    private Boolean active;
}
