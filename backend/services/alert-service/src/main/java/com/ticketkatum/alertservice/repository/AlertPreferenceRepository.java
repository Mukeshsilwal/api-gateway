package com.ticketkatum.alertservice.repository;

import com.ticketkatum.alertservice.entity.AlertPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertPreferenceRepository extends JpaRepository<AlertPreference, Long> {

    Optional<AlertPreference> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
