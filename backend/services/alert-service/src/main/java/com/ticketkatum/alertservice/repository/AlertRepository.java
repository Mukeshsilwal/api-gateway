package com.ticketkatum.alertservice.repository;

import com.ticketkatum.alertservice.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Alert> findByAlertTypeAndIsActiveTrueOrderByCreatedAtDesc(Alert.AlertType alertType);

    List<Alert> findBySeverityAndIsActiveTrueOrderByCreatedAtDesc(Alert.Severity severity);

    @Query("SELECT a FROM Alert a WHERE a.isActive = true " +
           "AND a.validFrom <= :now AND (a.validUntil IS NULL OR a.validUntil > :now) " +
           "ORDER BY a.severity DESC, a.createdAt DESC")
    List<Alert> findCurrentlyValidAlerts(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM Alert a WHERE a.isActive = true " +
           "AND a.affectedRegion = :region " +
           "AND a.validFrom <= :now AND (a.validUntil IS NULL OR a.validUntil > :now)")
    List<Alert> findActiveAlertsByRegion(@Param("region") String region, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Alert a WHERE a.isActive = true " +
           "AND a.affectedRoutes LIKE %:route% " +
           "AND a.validFrom <= :now AND (a.validUntil IS NULL OR a.validUntil > :now)")
    List<Alert> findActiveAlertsByRoute(@Param("route") String route, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Alert a WHERE a.isActive = true " +
           "AND a.severity IN :severities " +
           "AND a.validFrom <= :now AND (a.validUntil IS NULL OR a.validUntil > :now)")
    List<Alert> findActiveAlertsBySeverities(
            @Param("severities") List<Alert.Severity> severities,
            @Param("now") LocalDateTime now);
}
