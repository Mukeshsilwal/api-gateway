package com.ticketkatum.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRequestDto {
    @NotNull
    private Long hotelId;

    @NotNull
    private Long roomId;

    @NotNull
    private Long rentTypeId;

    @NotNull
    private Long mealPlanId;

    @NotNull
    private LocalDateTime checkIn;

    @NotNull
    private LocalDateTime checkOut;
}
