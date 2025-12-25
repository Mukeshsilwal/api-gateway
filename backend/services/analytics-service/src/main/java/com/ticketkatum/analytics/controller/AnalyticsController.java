package com.ticketkatum.analytics.controller;

import com.ticketkatum.analytics.entity.DailyMetric;
import com.ticketkatum.analytics.entity.RevenueStream;
import com.ticketkatum.analytics.entity.SystemEvent;
import com.ticketkatum.analytics.repository.DailyMetricRepository;
import com.ticketkatum.analytics.repository.RevenueStreamRepository;
import com.ticketkatum.analytics.repository.SystemEventRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Analytics", description = "APIs for Admin Dashboard and Reporting")
public class AnalyticsController {

    private final DailyMetricRepository dailyMetricRepository;
    private final RevenueStreamRepository revenueStreamRepository;
    private final SystemEventRepository systemEventRepository;

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get Dashboard Summary", description = "Get today's high-level KPIs")
    public ResponseEntity<DailyMetric> getDashboardSummary() {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(dailyMetricRepository.findById(today)
                .orElse(DailyMetric.builder().date(today).build()));
    }

    @GetMapping("/reports/daily-metrics")
    @Operation(summary = "Get Daily Metrics Report", description = "Get KPIs for a date range")
    public ResponseEntity<List<DailyMetric>> getDailyMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(dailyMetricRepository.findByDateBetweenOrderByDateAsc(from, to));
    }

    @GetMapping("/reports/revenue")
    @Operation(summary = "Get Revenue Breakdown", description = "Get revenue streams for a date range")
    public ResponseEntity<List<RevenueStream>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(revenueStreamRepository.findByDateBetween(from, to));
    }

    @GetMapping("/system/events")
    @Operation(summary = "Get System Events", description = "Get recent system events (audit log)")
    public ResponseEntity<List<SystemEvent>> getSystemEvents() {
        return ResponseEntity.ok(systemEventRepository.findTop50ByOrderByCreatedAtDesc());
    }
}
