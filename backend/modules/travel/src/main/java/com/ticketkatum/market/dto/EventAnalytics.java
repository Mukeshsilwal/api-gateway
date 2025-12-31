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
    private String eventId;

    // Revenue metrics
    private BigDecimal totalRevenue; // Total commission + F&B revenue
    private BigDecimal commissionEarned; // Commission from resale
    private BigDecimal fbRevenue; // F&B revenue
    private BigDecimal averageResalePrice; // Average resale ticket price

    // Resale metrics
    private int itemsSold; // Sold listings count
    private int resaleVolume; // Total listings count
    private int activeListings; // Currently active listings
    private int soldListings; // Sold listings

    // Other market features
    private int bundlesAvailable; // Active bundles
    private long loyaltyEngagement; // Total loyalty transactions
    private long fbProductCount; // F&B products available

    // Calculated metrics
    private int hypeIndex; // 0-100 demand indicator
}
