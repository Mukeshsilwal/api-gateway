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
public class PricingOptionDto {
    private Long rentTypeId;
    private String rentTypeName;
    private Long mealPlanId;
    private String mealPlanName;
    private BigDecimal totalPrice;
    private String priceBreakdown;
}
