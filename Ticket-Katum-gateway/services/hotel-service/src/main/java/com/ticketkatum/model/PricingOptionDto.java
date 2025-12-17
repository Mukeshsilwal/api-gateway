package com.ticketkatum.model;

import lombok.Data;

@Data
@Builder
public class PricingOptionDto {
    private Long rentTypeId;
    private String rentTypeName;
    private Long mealPlanId;
    private String mealPlanName;
    private BigDecimal totalPrice;
    private String priceBreakdown;
}
