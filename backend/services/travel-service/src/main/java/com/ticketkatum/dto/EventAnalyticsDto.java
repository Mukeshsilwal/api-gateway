package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Event Analytics DTO
 * Comprehensive analytics data for event organizers
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventAnalyticsDto {

    // Overview Stats
    private Long eventId;
    private String eventName;
    private Integer totalViews;
    private Integer totalBookings;
    private Integer totalTicketsSold;
    private Integer totalTicketsAvailable;
    private BigDecimal totalRevenue;
    private BigDecimal platformFees;
    private BigDecimal netRevenue;

    // Conversion Metrics
    private Double conversionRate; // (bookings / views) * 100
    private Double averageTicketsPerBooking;
    private BigDecimal averageOrderValue;

    // Ticket Type Breakdown
    private List<TicketTypeStatsDto> ticketTypeStats;

    // Time Series Data
    private List<DailyStatsDto> dailyStats;

    // Geographic Data
    private Map<String, Integer> bookingsByCity;
    private Map<String, Integer> bookingsByCountry;

    // Traffic Sources
    private Map<String, Integer> trafficSources; // Direct, Social, Search, etc.

    // Check-in Statistics
    private Integer totalCheckIns;
    private Integer pendingCheckIns;
    private Double checkInRate; // (checkedIn / totalTicketsSold) * 100

    // Promo Code Usage (if applicable)
    private Integer promoCodesUsed;
    private BigDecimal totalDiscountGiven;
}
