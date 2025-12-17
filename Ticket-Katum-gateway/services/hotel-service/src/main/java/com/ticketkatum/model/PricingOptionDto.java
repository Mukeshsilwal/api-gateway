package com.ticketkatum.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

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
