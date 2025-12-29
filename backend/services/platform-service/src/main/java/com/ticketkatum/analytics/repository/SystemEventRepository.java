package com.ticketkatum.analytics.repository;

import com.ticketkatum.analytics.entity.SystemEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemEventRepository extends JpaRepository<SystemEvent, Long> {
    List<SystemEvent> findTop50ByOrderByCreatedAtDesc();
    List<SystemEvent> findBySeverity(String severity);
}
