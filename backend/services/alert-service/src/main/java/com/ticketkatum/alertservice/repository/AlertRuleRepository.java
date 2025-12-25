package com.ticketkatum.alertservice.repository;

import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {

    List<AlertRule> findByIsActiveTrueOrderByPriorityDesc();

    List<AlertRule> findByAlertTypeAndIsActiveTrue(Alert.AlertType alertType);
}
