package com.ticketkatum.repository;

import com.ticketkatum.entity.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Organizer Repository
 */
@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, Long> {

    Optional<Organizer> findByUserId(Long userId);

    @Query("SELECT o FROM Organizer o WHERE o.userId = :userId AND o.deletedAt IS NULL")
    Optional<Organizer> findActiveByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
