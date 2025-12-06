package com.ticketkatum.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityRequest {
    @NotNull
    private String checkInDate;

    @NotNull
    private String checkOutDate;

    private Integer numberOfGuests;
}