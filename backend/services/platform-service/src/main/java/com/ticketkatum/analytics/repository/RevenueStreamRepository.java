package com.ticketkatum.analytics.repository;

import com.ticketkatum.analytics.entity.RevenueStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RevenueStreamRepository extends JpaRepository<RevenueStream, Long> {
    Optional<RevenueStream> findByDateAndServiceType(LocalDate date, String serviceType);
    List<RevenueStream> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
