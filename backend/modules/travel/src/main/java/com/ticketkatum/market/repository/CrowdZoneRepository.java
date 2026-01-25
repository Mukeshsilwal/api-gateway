package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.CrowdZone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface CrowdZoneRepository extends JpaRepository<CrowdZone, UUID> {
    List<CrowdZone> findByEventId(Long eventId);
}
