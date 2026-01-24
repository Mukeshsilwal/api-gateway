package com.ticketkatum.repository;

import com.ticketkatum.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "roles")
    Optional<User> findByEmail(String email);

    // OAuth-specific method
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "roles")
    org.springframework.data.domain.Page<User> findByRoles_Name(String roleName,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "roles")
    List<User> findByRoles_Name(String roleName);
}
