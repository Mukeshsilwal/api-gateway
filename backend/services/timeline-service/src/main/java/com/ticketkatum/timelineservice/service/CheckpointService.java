package com.ticketkatum.timelineservice.service;

import com.ticketkatum.timelineservice.dto.CheckpointDTO;
import com.ticketkatum.timelineservice.dto.CreateCheckpointRequest;
import com.ticketkatum.timelineservice.entity.Checkpoint;
import com.ticketkatum.timelineservice.entity.Timeline;
import com.ticketkatum.timelineservice.entity.TimelineEvent;
import com.ticketkatum.timelineservice.repository.CheckpointRepository;
import com.ticketkatum.timelineservice.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckpointService {

    private final CheckpointRepository checkpointRepository;
    private final TimelineRepository timelineRepository;
    private final ProgressService progressService;

    /**
     * Add checkpoint to timeline
     */
    @Transactional
    public CheckpointDTO addCheckpoint(Long timelineId, CreateCheckpointRequest request) {
        log.info("Adding checkpoint to timeline: {}", timelineId);

        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));

        // Get next sequence order
        long checkpointCount = checkpointRepository.countByTimeline_TimelineId(timelineId);

        Checkpoint checkpoint = Checkpoint.builder()
                .timeline(timeline)
                .checkpointType(request.getCheckpointType())
                .locationName(request.getLocationName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .scheduledTime(request.getScheduledTime())
                .sequenceOrder((int) checkpointCount + 1)
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .status(Checkpoint.CheckpointStatus.PENDING)
                .build();

        checkpoint = checkpointRepository.save(checkpoint);

        // Add event
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.CHECKPOINT_REACHED)
                .description("Checkpoint added: " + checkpoint.getLocationName())
                .build());
        timelineRepository.save(timeline);

        log.info("Checkpoint created with ID: {}", checkpoint.getCheckpointId());

        return convertToDTO(checkpoint);
    }

    /**
     * Mark checkpoint as reached
     */
    @Transactional
    public CheckpointDTO markCheckpointReached(Long checkpointId) {
        log.info("Marking checkpoint {} as reached", checkpointId);

        Checkpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Checkpoint not found: " + checkpointId));

        checkpoint.markAsReached();
        checkpoint = checkpointRepository.save(checkpoint);

        // Update timeline
        Timeline timeline = checkpoint.getTimeline();
        timeline.setCurrentCheckpointId(checkpointId);
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.CHECKPOINT_REACHED)
                .description("Checkpoint reached: " + checkpoint.getLocationName())
                .build());

        // Recalculate progress
        timeline.setProgressPercentage(progressService.calculateProgress(timeline.getTimelineId()));
        timelineRepository.save(timeline);

        return convertToDTO(checkpoint);
    }

    /**
     * Skip checkpoint
     */
    @Transactional
    public CheckpointDTO skipCheckpoint(Long checkpointId) {
        log.info("Skipping checkpoint: {}", checkpointId);

        Checkpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Checkpoint not found: " + checkpointId));

        checkpoint.markAsSkipped();
        checkpoint = checkpointRepository.save(checkpoint);

        // Add event
        Timeline timeline = checkpoint.getTimeline();
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.CHECKPOINT_SKIPPED)
                .description("Checkpoint skipped: " + checkpoint.getLocationName())
                .build());
        timelineRepository.save(timeline);

        return convertToDTO(checkpoint);
    }

    /**
     * Update checkpoint ETA
     */
    @Transactional
    public CheckpointDTO updateCheckpointETA(Long checkpointId, LocalDateTime newETA) {
        log.info("Updating checkpoint {} ETA to: {}", checkpointId, newETA);

        Checkpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Checkpoint not found: " + checkpointId));

        checkpoint.updateETA(newETA);

        // Check if delayed
        if (checkpoint.isDelayed()) {
            checkpoint.markAsDelayed();
            
            // Add delay event
            Timeline timeline = checkpoint.getTimeline();
            timeline.addEvent(TimelineEvent.builder()
                    .eventType(TimelineEvent.EventType.CHECKPOINT_DELAYED)
                    .description("Checkpoint delayed: " + checkpoint.getLocationName())
                    .build());
            timelineRepository.save(timeline);
        }

        checkpoint = checkpointRepository.save(checkpoint);

        return convertToDTO(checkpoint);
    }

    /**
     * Get current checkpoint
     */
    @Transactional(readOnly = true)
    public CheckpointDTO getCurrentCheckpoint(Long timelineId) {
        log.debug("Getting current checkpoint for timeline: {}", timelineId);

        Checkpoint checkpoint = checkpointRepository.findCurrentCheckpoint(timelineId)
                .orElse(null);

        return checkpoint != null ? convertToDTO(checkpoint) : null;
    }

    /**
     * Get next checkpoint
     */
    @Transactional(readOnly = true)
    public CheckpointDTO getNextCheckpoint(Long timelineId) {
        log.debug("Getting next checkpoint for timeline: {}", timelineId);

        Checkpoint checkpoint = checkpointRepository.findNextCheckpoint(timelineId)
                .orElse(null);

        return checkpoint != null ? convertToDTO(checkpoint) : null;
    }

    /**
     * Get upcoming checkpoints
     */
    @Transactional(readOnly = true)
    public List<CheckpointDTO> getUpcomingCheckpoints(Long timelineId, int limit) {
        log.debug("Getting upcoming checkpoints for timeline: {}", timelineId);

        List<Checkpoint> checkpoints = checkpointRepository.findUpcomingCheckpoints(
                timelineId, LocalDateTime.now(), limit
        );

        return checkpoints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete checkpoint
     */
    @Transactional
    public void deleteCheckpoint(Long checkpointId) {
        log.info("Deleting checkpoint: {}", checkpointId);

        Checkpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new RuntimeException("Checkpoint not found: " + checkpointId));

        Timeline timeline = checkpoint.getTimeline();
        checkpointRepository.delete(checkpoint);

        // Recalculate progress
        timeline.setProgressPercentage(progressService.calculateProgress(timeline.getTimelineId()));
        timelineRepository.save(timeline);
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
