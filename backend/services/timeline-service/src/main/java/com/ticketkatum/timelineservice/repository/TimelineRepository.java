package com.ticketkatum.timelineservice.repository;

import com.ticketkatum.timelineservice.entity.Timeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimelineRepository extends JpaRepository<Timeline, Long> {

    /**
     * Find timeline by journey ID
     */
    Optional<Timeline> findByJourneyId(Long journeyId);

    /**
     * Check if timeline exists for journey
     */
    boolean existsByJourneyId(Long journeyId);

    /**
     * Find all timelines for a user
     */
    List<Timeline> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find active timelines for a user
     */
    @Query("SELECT t FROM Timeline t WHERE t.userId = :userId AND t.status IN ('ACTIVE', 'PAUSED')")
    List<Timeline> findActiveTimelinesByUserId(@Param("userId") Long userId);

    /**
     * Find timeline with all details (checkpoints, events, delays)
     */
    @Query("SELECT DISTINCT t FROM Timeline t " +
           "LEFT JOIN FETCH t.checkpoints " +
           "LEFT JOIN FETCH t.events " +
           "LEFT JOIN FETCH t.delays " +
           "LEFT JOIN FETCH t.notifications " +
           "WHERE t.timelineId = :timelineId")
    Optional<Timeline> findByIdWithDetails(@Param("timelineId") Long timelineId);

    /**
     * Find timelines by status
     */
    List<Timeline> findByStatus(Timeline.TimelineStatus status);

    /**
     * Find timelines that are delayed
     */
    @Query("SELECT t FROM Timeline t WHERE t.isOnSchedule = false")
    List<Timeline> findDelayedTimelines();

    /**
     * Count timelines by user
     */
    long countByUserId(Long userId);

    /**
     * Count active timelines by user
     */
    @Query("SELECT COUNT(t) FROM Timeline t WHERE t.userId = :userId AND t.status IN ('ACTIVE', 'PAUSED')")
    long countActiveTimelinesByUserId(@Param("userId") Long userId);
}
