package com.ticketkatum.dto.hotel.request;

import com.ticketkatum.dto.hotel.HotelRecommendation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyHotelResponse {
    private List<HotelRecommendation> hotels;
    private Integer totalResults;
    private Integer page;
    private Integer totalPages;
    private SearchLocation searchLocation;
}
