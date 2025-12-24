package com.ticketkatum.dto.hotel.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequestDto {
    private Long hotelId;
    private String roomType; // Added to match hotel service requirements
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer guestsCount;
}
