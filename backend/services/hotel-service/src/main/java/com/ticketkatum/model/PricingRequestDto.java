package com.ticketkatum.model;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PricingRequestDto {
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
