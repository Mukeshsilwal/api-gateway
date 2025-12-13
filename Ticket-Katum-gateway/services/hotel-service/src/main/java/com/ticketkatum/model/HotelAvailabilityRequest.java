package com.ticketkatum.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelAvailabilityRequest {
    private LocalDate checkIn;
    private LocalDate checkOut;
    private List<Long> roomIds;
    private Integer numberOfGuests;
}
