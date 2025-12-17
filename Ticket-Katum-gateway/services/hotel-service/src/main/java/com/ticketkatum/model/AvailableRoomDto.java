package com.ticketkatum.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@Builder
public class AvailableRoomDto {
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private Integer capacity;
    private Set<String> amenities;
    private List<PricingOptionDto> pricingOptions;
}
