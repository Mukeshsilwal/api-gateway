package com.ticketkatum.alertservice.service;

import com.ticketkatum.alertservice.entity.SOSTrigger;
import com.ticketkatum.alertservice.repository.SOSTriggerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SOSService {

    private final SOSTriggerRepository repository;

    @Transactional
    public SOSTrigger triggerSOS(Map<String, Object> data) {
        log.info("SOS Service: Triggering SOS for user: {}", data.get("userId"));
        
        SOSTrigger sos = SOSTrigger.builder()
                .userId(getLong(data.get("userId")))
                .tripId(getLong(data.get("tripId")))
                .latitude(getBigDecimal(data.get("latitude")))
                .longitude(getBigDecimal(data.get("longitude")))
                .message((String) data.get("message"))
                .status(SOSTrigger.SOSStatus.ACTIVE)
                .lastHeartbeat(LocalDateTime.now())
                .build();
        
        return repository.save(sos);
    }

    @Transactional
    public SOSTrigger updateHeartbeat(Long sosId, Map<String, Object> data) {
        SOSTrigger sos = repository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        
        sos.setLatitude(getBigDecimal(data.get("latitude")));
        sos.setLongitude(getBigDecimal(data.get("longitude")));
        sos.setLastHeartbeat(LocalDateTime.now());
        
        return repository.save(sos);
    }

    public List<SOSTrigger> getActiveSOSForUser(Long userId) {
        return repository.findByUserIdAndStatus(userId, SOSTrigger.SOSStatus.ACTIVE);
    }

    public List<SOSTrigger> getAllActiveSOS() {
        return repository.findByStatus(SOSTrigger.SOSStatus.ACTIVE);
    }

    private Long getLong(Object o) {
        if (o == null) return null;
        if (o instanceof Integer) return ((Integer) o).longValue();
        if (o instanceof Long) return (Long) o;
        return Long.parseLong(o.toString());
    }

    private BigDecimal getBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        return new BigDecimal(o.toString());
    }
}
