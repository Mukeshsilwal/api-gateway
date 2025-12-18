package com.ticketkatum.dto.market;

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
    private String eventId; 
    private BigDecimal totalRevenue; 
    private int itemsSold;
    private int resaleVolume;
    private double occupancyRate; 
    private int hypeIndex; 
}
