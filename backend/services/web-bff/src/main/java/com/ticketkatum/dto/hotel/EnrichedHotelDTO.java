package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedHotelDTO {
    private HotelDTO hotel;
    private HotelRecommendation recommendation;
    private boolean isNearby;
    private Double distance;
}
