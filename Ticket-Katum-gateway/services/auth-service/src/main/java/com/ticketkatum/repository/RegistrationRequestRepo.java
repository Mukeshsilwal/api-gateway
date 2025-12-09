package com.ticketkatum.repository;

import com.ticketkatum.entity.RegistrationRequest;
import com.ticketkatum.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRequestRepo extends JpaRepository<RegistrationRequest, Long> {
    boolean existsByEmailAndStatus(String email, RequestStatus status);
    List<RegistrationRequest> findAllByOrderByRequestedAtDesc();
    List<RegistrationRequest> findByStatusOrderByRequestedAtDesc(RequestStatus status);
    long countByStatus(RequestStatus status);
}
