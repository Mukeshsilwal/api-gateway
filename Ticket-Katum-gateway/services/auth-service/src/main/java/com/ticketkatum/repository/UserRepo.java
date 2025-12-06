package com.ticketkatum.repository;

import com.ticketkatum.entity.Users;
import com.ticketkatum.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmailAndRole(String email, Role role);

    boolean existsByEmail(String email);
}
