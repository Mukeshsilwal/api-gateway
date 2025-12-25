package com.ticketkatum.timelineservice.repository;

import com.ticketkatum.timelineservice.entity.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {

    /**
     * Find all checkpoints for a timeline, ordered by sequence
     */
    List<Checkpoint> findByTimeline_TimelineIdOrderBySequenceOrderAsc(Long timelineId);

    /**
     * Find checkpoints by status
     */
    List<Checkpoint> findByTimeline_TimelineIdAndStatus(Long timelineId, Checkpoint.CheckpointStatus status);

    /**
     * Find pending checkpoints
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId AND c.status = 'PENDING' ORDER BY c.sequenceOrder")
    List<Checkpoint> findPendingCheckpoints(@Param("timelineId") Long timelineId);

    /**
     * Find completed checkpoints
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId AND c.status = 'COMPLETED' ORDER BY c.sequenceOrder")
    List<Checkpoint> findCompletedCheckpoints(@Param("timelineId") Long timelineId);

    /**
     * Find next checkpoint (first pending checkpoint)
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId AND c.status = 'PENDING' ORDER BY c.sequenceOrder LIMIT 1")
    Optional<Checkpoint> findNextCheckpoint(@Param("timelineId") Long timelineId);

    /**
     * Find current checkpoint (in progress)
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId AND c.status = 'IN_PROGRESS'")
    Optional<Checkpoint> findCurrentCheckpoint(@Param("timelineId") Long timelineId);

    /**
     * Find checkpoints scheduled between times
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.scheduledTime BETWEEN :startTime AND :endTime AND c.reminderSent = false")
    List<Checkpoint> findCheckpointsScheduledBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Find upcoming checkpoints (next N checkpoints)
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId " +
           "AND c.status IN ('PENDING', 'IN_PROGRESS') " +
           "AND c.scheduledTime > :now " +
           "ORDER BY c.scheduledTime LIMIT :limit")
    List<Checkpoint> findUpcomingCheckpoints(
            @Param("timelineId") Long timelineId,
            @Param("now") LocalDateTime now,
            @Param("limit") int limit
    );

    /**
     * Find delayed checkpoints
     */
    @Query("SELECT c FROM Checkpoint c WHERE c.timeline.timelineId = :timelineId AND c.status = 'DELAYED'")
    List<Checkpoint> findDelayedCheckpoints(@Param("timelineId") Long timelineId);

    /**
     * Count checkpoints by timeline
     */
    long countByTimeline_TimelineId(Long timelineId);

    /**
     * Count completed checkpoints
     */
    long countByTimeline_TimelineIdAndStatus(Long timelineId, Checkpoint.CheckpointStatus status);

    /**
     * Find checkpoints by type
     */
    List<Checkpoint> findByTimeline_TimelineIdAndCheckpointType(Long timelineId, Checkpoint.CheckpointType type);
}
