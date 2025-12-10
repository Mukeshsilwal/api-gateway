package com.ticketkatum.dto.hotel.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityRequest {
    private LocalDate checkIn;
    private LocalDate checkOut;
    private List<Long> roomIds;
    private Integer numberOfGuests;
}