package com.ticketkatum.journeyservice.repository;

import com.ticketkatum.journeyservice.entity.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {

    /**
     * Find journey by trip ID
     */
    Optional<Journey> findByTripId(Long tripId);

    /**
     * Find all journeys for a user
     */
    List<Journey> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find journeys by user and status
     */
    List<Journey> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Journey.JourneyStatus status);

    /**
     * Find journey with all related data (segments, suggestions, waypoints)
     */
    @Query("SELECT j FROM Journey j " +
           "LEFT JOIN FETCH j.segments " +
           "LEFT JOIN FETCH j.suggestions " +
           "LEFT JOIN FETCH j.waypoints " +
           "WHERE j.journeyId = :journeyId")
    Optional<Journey> findByIdWithDetails(@Param("journeyId") Long journeyId);

    /**
     * Find active journeys for a user
     */
    @Query("SELECT j FROM Journey j " +
           "WHERE j.userId = :userId " +
           "AND j.status IN ('PLANNED', 'IN_PROGRESS') " +
           "ORDER BY j.createdAt DESC")
    List<Journey> findActiveJourneysByUserId(@Param("userId") Long userId);

    /**
     * Check if journey exists for trip
     */
    boolean existsByTripId(Long tripId);

    /**
     * Count journeys by user
     */
    long countByUserId(Long userId);

    /**
     * Count journeys by user and status
     */
    long countByUserIdAndStatus(Long userId, Journey.JourneyStatus status);
}
