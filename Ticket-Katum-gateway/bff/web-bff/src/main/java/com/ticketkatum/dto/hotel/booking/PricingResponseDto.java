package com.ticketkatum.dto.hotel.booking;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponseDto {
    private BigDecimal baseRate;
    private BigDecimal mealCost;
    private Integer units;
    private String rentTypeName;
    private String mealPlanName;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private String priceBreakdown;
}
