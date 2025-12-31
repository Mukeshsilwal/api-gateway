package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PriceRange {
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}
