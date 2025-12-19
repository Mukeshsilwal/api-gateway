package com.ticketkatum.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AvailabilityRequestDto {
    @NotNull
    private Long hotelId;

    @NotNull
    private String roomType;

    @NotNull
    private LocalDateTime checkIn;

    @NotNull
    private LocalDateTime checkOut;

    @NotNull
    @Min(1)
    private Integer guestsCount;
}

