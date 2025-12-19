package com.ticketkatum.repository;

import com.ticketkatum.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepo extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByUsername(String username);

    Optional<AdminUser> findByEmail(String email);
    boolean existsByUsername(String username);
}
