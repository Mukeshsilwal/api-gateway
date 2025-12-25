package com.ticketkatum.alertservice.repository;

import com.ticketkatum.alertservice.entity.SOSTrigger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSTriggerRepository extends JpaRepository<SOSTrigger, Long> {
    List<SOSTrigger> findByUserIdAndStatus(Long userId, SOSTrigger.SOSStatus status);
    List<SOSTrigger> findByStatus(SOSTrigger.SOSStatus status);
}
