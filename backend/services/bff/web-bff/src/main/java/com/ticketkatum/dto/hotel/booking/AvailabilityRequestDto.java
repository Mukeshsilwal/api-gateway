package com.ticketkatum.dto.hotel.booking;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AvailabilityRequestDto {
    private Long hotelId;
    private String roomType;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer guestsCount;
}
