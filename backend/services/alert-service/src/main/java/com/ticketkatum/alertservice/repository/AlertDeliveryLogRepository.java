package com.ticketkatum.alertservice.repository;

import com.ticketkatum.alertservice.entity.AlertDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertDeliveryLogRepository extends JpaRepository<AlertDeliveryLog, Long> {

    List<AlertDeliveryLog> findByAlert_AlertId(Long alertId);

    List<AlertDeliveryLog> findByStatus(AlertDeliveryLog.DeliveryStatus status);
}
