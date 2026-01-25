package com.ticketkatum.repository;

import com.ticketkatum.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@org.springframework.stereotype.Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByUserEmail(String email);
}
