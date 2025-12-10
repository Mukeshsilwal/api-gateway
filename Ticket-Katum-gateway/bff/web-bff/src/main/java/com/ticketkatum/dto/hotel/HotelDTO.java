package com.ticketkatum.dto.hotel;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDTO {

    private Long id;

    private String hotelCode;
    private String name;
    private String description;

    private String address;
    private String city;
    private String country;
    private String phone;
    private String email;
    private String zipCode;

    private Double latitude;
    private Double longitude;

    private Integer stars;
    private Double rating;
    private Integer starRating;
    private  String imageUrl;

    private List<String> amenities;

    private String website;

    private Set<String> images;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private Double averageRating;
    private Integer totalReviews;

    private Boolean active;
    private Boolean featured;

    // Only IDs – avoids infinite recursion
    private Integer totalRooms;
    private Long nearestRoomId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
