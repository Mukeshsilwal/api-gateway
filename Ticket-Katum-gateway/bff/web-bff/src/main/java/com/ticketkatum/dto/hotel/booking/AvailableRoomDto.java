package com.ticketkatum.dto.hotel.booking;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableRoomDto {
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private Integer capacity;
    private Set<String> amenities;
    private List<PricingOptionDto> pricingOptions;
}
