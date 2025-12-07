package com.ticketkatum.dto;

import com.ticketkatum.dto.hotel.EnrichedRoomDTO;
import com.ticketkatum.dto.hotel.PriceRange;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedHotelDetails {
    private List<EnrichedRoomDTO> rooms;
    private int activeStaffCount;
    private int totalRooms;
    private int availableRooms;
    private int roomsUnderMaintenance;
    private Double averageRating;
    private int reviewCount;
    private PriceRange priceRange;
    private List<String> amenities;
}
