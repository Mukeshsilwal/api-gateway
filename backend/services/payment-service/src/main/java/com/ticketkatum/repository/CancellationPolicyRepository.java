package com.ticketkatum.repository;

import com.ticketkatum.entity.CancellationPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, Long> {

    List<CancellationPolicy> findByEventIdAndIsActiveOrderByHoursBeforeDesc(Long eventId, boolean isActive);

    @Query("SELECT cp FROM CancellationPolicy cp WHERE cp.eventId IS NULL AND cp.isActive = true ORDER BY cp.hoursBefore DESC")
    List<CancellationPolicy> findDefaultPolicies();

    @Query("SELECT cp FROM CancellationPolicy cp WHERE " +
            "(cp.eventId = :eventId OR cp.eventId IS NULL) " +
            "AND cp.isActive = true " +
            "ORDER BY cp.eventId DESC NULLS LAST, cp.hoursBefore DESC")
    List<CancellationPolicy> findApplicablePolicies(Long eventId);

    Optional<CancellationPolicy> findTopByEventIdAndHoursBeforeLessThanEqualAndIsActiveOrderByHoursBeforeDesc(
            Long eventId, Integer hoursBefore, boolean isActive);
}