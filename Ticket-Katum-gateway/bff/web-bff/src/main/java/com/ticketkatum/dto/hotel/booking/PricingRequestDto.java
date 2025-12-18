package com.ticketkatum.dto.hotel.booking;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRequestDto {
    private Long roomId;
    private Long rentTypeId;
    private Long mealPlanId;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}
