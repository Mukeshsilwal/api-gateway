package com.ticketkatum.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAnalytics {
    private String eventId; // UUID as String
    private BigDecimal totalRevenue; // Primary + Resale Commission
    private int itemsSold;
    private int resaleVolume;
    private double occupancyRate; // 0.0 to 1.0
    private int hypeIndex; // Calculated metric
}
