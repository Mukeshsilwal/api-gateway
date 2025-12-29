package com.ticketkatum.sos.repository;

import com.ticketkatum.sos.entity.SafetyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SafetyStatusRepository extends JpaRepository<SafetyStatus, Long> {
    Optional<SafetyStatus> findByUserId(Long userId);
}
