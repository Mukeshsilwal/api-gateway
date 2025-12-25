package com.ticketkatum.analytics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMetric {

    @Id
    @Column(name = "date")
    private LocalDate date;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "active_users")
    private Integer activeUsers = 0;

    @Column(name = "new_signups")
    private Integer newSignups = 0;

    @Column(name = "sos_alerts_triggered")
    private Integer sosAlertsTriggered = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
