package com.ticketkatum.repository;

import com.ticketkatum.entity.AdminRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepo extends JpaRepository<AdminRegistrationRequest, Long> {
}
