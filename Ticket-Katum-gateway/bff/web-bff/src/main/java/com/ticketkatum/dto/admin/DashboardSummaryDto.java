package com.ticketkatum.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDto {
    private Totals totals;
    private LiveTrackingStatus liveTracking;
    private List<RevenueData> revenueSeries;
    private List<RecentActivity> recentActivity;
    private SystemHealth systemHealth;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Totals {
        private int buses;
        private int routes;
        private int bookings;
        private BigDecimal revenueNPR;
        private int hotels;
        private int movies;
        private int activeTripsToday;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LiveTrackingStatus {
        private boolean gpsActive;
        private int activeBuses;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueData {
        private String date;
        private BigDecimal amountNPR;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentActivity {
        private String id;
        private String type; // booking, bus, etc
        private String title;
        private LocalDateTime ts;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SystemHealth {
        private String status; // ok, degraded, down
        private LocalDateTime lastCheckTs;
    }
}
