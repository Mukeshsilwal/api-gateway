package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.CrowdZone;
import com.ticketkatum.market.domain.ZoneStatus;
import com.ticketkatum.market.repository.CrowdZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrowdFlowService {

    private final CrowdZoneRepository zoneRepository;

    public List<CrowdZone> getHeatmap(UUID eventId) {
        return zoneRepository.findByEventId(eventId);
    }

    public CrowdZone createZone(CrowdZone zone) {
        zone.setCurrentOccupancy(0);
        zone.setStatus(ZoneStatus.GREEN);
        return zoneRepository.save(zone);
    }

    @Transactional
    public CrowdZone recordScan(UUID zoneId, String direction) {
        CrowdZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Zone not found"));

        if ("IN".equalsIgnoreCase(direction)) {
            zone.setCurrentOccupancy(zone.getCurrentOccupancy() + 1);
        } else if ("OUT".equalsIgnoreCase(direction)) {
            zone.setCurrentOccupancy(Math.max(0, zone.getCurrentOccupancy() - 1));
        }

        zone.updateStatus(); // Recalculate Green/Yellow/Red
        
        if (zone.getStatus() == ZoneStatus.RED) {
            log.warn("ALERT: Zone {} is OVERCROWDED ({} / {})", zone.getZoneName(), zone.getCurrentOccupancy(), zone.getCapacity());
            // In real app: Trigger Push Notification or SMS to staff
        }

        return zoneRepository.save(zone);
    }
}
