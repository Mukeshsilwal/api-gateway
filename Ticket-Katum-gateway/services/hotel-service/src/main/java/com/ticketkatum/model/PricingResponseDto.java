package com.ticketkatum.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
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
