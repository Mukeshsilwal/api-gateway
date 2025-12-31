package com.ticketkatum.sos.repository;

import com.ticketkatum.sos.entity.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {
    List<EmergencyAlert> findByUserIdOrderByTriggeredAtDesc(Long userId);
    List<EmergencyAlert> findByStatus(EmergencyAlert.AlertStatus status);
}
