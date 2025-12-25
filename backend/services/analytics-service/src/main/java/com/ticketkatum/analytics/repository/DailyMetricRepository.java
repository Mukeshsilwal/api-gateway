package com.ticketkatum.analytics.repository;

import com.ticketkatum.analytics.entity.DailyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyMetricRepository extends JpaRepository<DailyMetric, LocalDate> {
    List<DailyMetric> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
