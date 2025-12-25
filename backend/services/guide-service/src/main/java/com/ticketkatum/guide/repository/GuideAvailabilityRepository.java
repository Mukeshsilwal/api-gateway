package com.ticketkatum.guide.repository;

import com.ticketkatum.guide.entity.GuideAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuideAvailabilityRepository extends JpaRepository<GuideAvailability, Long> {

    List<GuideAvailability> findByGuide_GuideIdAndDateBetween(Long guideId, LocalDate startDate, LocalDate endDate);

    boolean existsByGuide_GuideIdAndDateAndStatus(Long guideId, LocalDate date, GuideAvailability.AvailabilityStatus status);

    @Query("SELECT ga FROM GuideAvailability ga WHERE ga.guide.guideId = :guideId AND ga.date >= :date ORDER BY ga.date ASC")
    List<GuideAvailability> findFutureAvailability(@Param("guideId") Long guideId, @Param("date") LocalDate date);
}
