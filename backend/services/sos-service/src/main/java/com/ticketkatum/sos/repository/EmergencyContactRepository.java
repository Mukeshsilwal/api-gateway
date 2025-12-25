package com.ticketkatum.sos.repository;

import com.ticketkatum.sos.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserIdAndIsActiveTrue(Long userId);
}
