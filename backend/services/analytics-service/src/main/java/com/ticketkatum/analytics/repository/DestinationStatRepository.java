package com.ticketkatum.analytics.repository;

import com.ticketkatum.analytics.entity.DestinationStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DestinationStatRepository extends JpaRepository<DestinationStat, Long> {
    Optional<DestinationStat> findByLocationName(String locationName);
}
