package com.ticketkatum.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingConfiguration {
    private String rentType;
    private String mealPlan;
    private String mealService;
    private BigDecimal price;
}
