package com.ticketkatum.timelineservice.service;

import com.ticketkatum.timelineservice.dto.CheckpointDTO;
import com.ticketkatum.timelineservice.dto.ProgressDTO;
import com.ticketkatum.timelineservice.entity.Checkpoint;
import com.ticketkatum.timelineservice.entity.Delay;
import com.ticketkatum.timelineservice.repository.CheckpointRepository;
import com.ticketkatum.timelineservice.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressService {

    private final CheckpointRepository checkpointRepository;
    private final TimelineRepository timelineRepository;

    /**
     * Calculate progress percentage
     */
    public BigDecimal calculateProgress(Long timelineId) {
        log.debug("Calculating progress for timeline: {}", timelineId);
        
        long totalCheckpoints = checkpointRepository.countByTimeline_TimelineId(timelineId);
        long completedCheckpoints = checkpointRepository.countByTimeline_TimelineIdAndStatus(
                timelineId, Checkpoint.CheckpointStatus.COMPLETED
        );
        
        if (totalCheckpoints == 0) {
            return BigDecimal.ZERO;
        }
        
        return BigDecimal.valueOf(completedCheckpoints)
                .divide(BigDecimal.valueOf(totalCheckpoints), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Check if timeline is on schedule
     */
    public boolean isOnSchedule(Long timelineId) {
        log.debug("Checking if timeline {} is on schedule", timelineId);
        
        List<Checkpoint> delayedCheckpoints = checkpointRepository.findDelayedCheckpoints(timelineId);
        return delayedCheckpoints.isEmpty();
    }

    /**
     * Calculate total delay in minutes
     */
    public int calculateTotalDelay(Long timelineId) {
        log.debug("Calculating total delay for timeline: {}", timelineId);
        
        var timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        return timeline.getDelays().stream()
                .filter(Delay::isActive)
                .mapToInt(Delay::getDelayMinutes)
                .sum();
    }

    /**
     * Get detailed progress information
     */
    @Transactional(readOnly = true)
    public ProgressDTO getProgressDetails(Long timelineId) {
        log.debug("Getting progress details for timeline: {}", timelineId);
        
        long totalCheckpoints = checkpointRepository.countByTimeline_TimelineId(timelineId);
        long completedCheckpoints = checkpointRepository.countByTimeline_TimelineIdAndStatus(
                timelineId, Checkpoint.CheckpointStatus.COMPLETED
        );
        long pendingCheckpoints = totalCheckpoints - completedCheckpoints;
        
        BigDecimal progress = calculateProgress(timelineId);
        boolean onSchedule = isOnSchedule(timelineId);
        int totalDelay = calculateTotalDelay(timelineId);
        
        // Get current and next checkpoints
        Optional<Checkpoint> currentOpt = checkpointRepository.findCurrentCheckpoint(timelineId);
        Optional<Checkpoint> nextOpt = checkpointRepository.findNextCheckpoint(timelineId);
        
        // Estimate completion time
        LocalDateTime estimatedCompletion = estimateCompletionTime(timelineId);
        
        return ProgressDTO.builder()
                .timelineId(timelineId)
                .progressPercentage(progress)
                .totalCheckpoints((int) totalCheckpoints)
                .completedCheckpoints((int) completedCheckpoints)
                .pendingCheckpoints((int) pendingCheckpoints)
                .currentCheckpoint(currentOpt.map(this::convertToDTO).orElse(null))
                .nextCheckpoint(nextOpt.map(this::convertToDTO).orElse(null))
                .isOnSchedule(onSchedule)
                .totalDelayMinutes(totalDelay)
                .estimatedCompletionTime(estimatedCompletion)
                .build();
    }

    /**
     * Estimate completion time
     */
    private LocalDateTime estimateCompletionTime(Long timelineId) {
        List<Checkpoint> checkpoints = checkpointRepository
                .findByTimeline_TimelineIdOrderBySequenceOrderAsc(timelineId);
        
        if (checkpoints.isEmpty()) {
            return LocalDateTime.now();
        }
        
        // Get last checkpoint's scheduled time
        Checkpoint lastCheckpoint = checkpoints.get(checkpoints.size() - 1);
        LocalDateTime estimatedTime = lastCheckpoint.getScheduledTime();
        
        // Add total delay
        int totalDelay = calculateTotalDelay(timelineId);
        if (totalDelay > 0) {
            estimatedTime = estimatedTime.plusMinutes(totalDelay);
        }
        
        return estimatedTime;
    }

    /**
     * Convert Checkpoint to DTO
     */
    private CheckpointDTO convertToDTO(Checkpoint checkpoint) {
        return CheckpointDTO.builder()
                .checkpointId(checkpoint.getCheckpointId())
                .checkpointType(checkpoint.getCheckpointType())
                .locationName(checkpoint.getLocationName())
                .latitude(checkpoint.getLatitude())
                .longitude(checkpoint.getLongitude())
                .scheduledTime(checkpoint.getScheduledTime())
                .actualTime(checkpoint.getActualTime())
                .estimatedArrivalTime(checkpoint.getEstimatedArrivalTime())
                .status(checkpoint.getStatus())
                .sequenceOrder(checkpoint.getSequenceOrder())
                .durationMinutes(checkpoint.getDurationMinutes())
                .notes(checkpoint.getNotes())
                .reminderSent(checkpoint.getReminderSent())
                .delayMinutes(checkpoint.getDelayMinutes())
                .createdAt(checkpoint.getCreatedAt())
                .updatedAt(checkpoint.getUpdatedAt())
                .build();
    }
}
