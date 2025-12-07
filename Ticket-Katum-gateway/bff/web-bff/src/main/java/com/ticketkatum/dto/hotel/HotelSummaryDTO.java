package com.ticketkatum.dto.hotel;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class HotelSummaryDTO {
    private Long id;
    private String name;
    private String city;
    private Integer stars;
    private Double averageRating;
    private double reviewCount;
    private PriceRange priceRange;
    private int availableRooms;
    private String thumbnailImage;
}
