package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Daily Statistics DTO
 * Day-by-day analytics for time series charts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatsDto {
    private LocalDate date;
    private Integer views;
    private Integer bookings;
    private Integer ticketsSold;
    private BigDecimal revenue;
}
