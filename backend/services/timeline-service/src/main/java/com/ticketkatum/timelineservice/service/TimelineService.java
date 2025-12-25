package com.ticketkatum.timelineservice.service;

import com.ticketkatum.timelineservice.dto.*;
import com.ticketkatum.timelineservice.entity.*;
import com.ticketkatum.timelineservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimelineService {

    private final TimelineRepository timelineRepository;
    private final CheckpointRepository checkpointRepository;
    private final ProgressService progressService;

    /**
     * Generate timeline from journey
     */
    @Transactional
    public TimelineDTO generateTimeline(Long journeyId, Long tripId, Long userId) {
        log.info("Generating timeline for journey: {}", journeyId);

        // Check if timeline already exists
        if (timelineRepository.existsByJourneyId(journeyId)) {
            throw new RuntimeException("Timeline already exists for journey: " + journeyId);
        }

        // Create timeline
        Timeline timeline = Timeline.builder()
                .journeyId(journeyId)
                .tripId(tripId)
                .userId(userId)
                .status(Timeline.TimelineStatus.PENDING)
                .progressPercentage(BigDecimal.ZERO)
                .isOnSchedule(true)
                .delayMinutes(0)
                .build();

        // Add creation event
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.CREATED)
                .description("Timeline created for journey " + journeyId)
                .build());

        timeline = timelineRepository.save(timeline);
        log.info("Timeline created with ID: {}", timeline.getTimelineId());

        return convertToDTO(timeline);
    }

    /**
     * Get timeline by ID
     */
    @Transactional(readOnly = true)
    public TimelineDTO getTimeline(Long timelineId) {
        log.debug("Fetching timeline: {}", timelineId);
        
        Timeline timeline = timelineRepository.findByIdWithDetails(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        return convertToDTO(timeline);
    }

    /**
     * Get timeline by journey ID
     */
    @Transactional(readOnly = true)
    public TimelineDTO getTimelineByJourneyId(Long journeyId) {
        log.debug("Fetching timeline for journey: {}", journeyId);
        
        Timeline timeline = timelineRepository.findByJourneyId(journeyId)
                .orElseThrow(() -> new RuntimeException("Timeline not found for journey: " + journeyId));
        
        return convertToDTO(timeline);
    }

    /**
     * Get all timelines for a user
     */
    @Transactional(readOnly = true)
    public List<TimelineDTO> getUserTimelines(Long userId) {
        log.debug("Fetching timelines for user: {}", userId);
        
        List<Timeline> timelines = timelineRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return timelines.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active timelines for a user
     */
    @Transactional(readOnly = true)
    public List<TimelineDTO> getActiveTimelines(Long userId) {
        log.debug("Fetching active timelines for user: {}", userId);
        
        List<Timeline> timelines = timelineRepository.findActiveTimelinesByUserId(userId);
        
        return timelines.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update timeline status
     */
    @Transactional
    public TimelineDTO updateTimelineStatus(Long timelineId, Timeline.TimelineStatus status) {
        log.info("Updating timeline {} status to: {}", timelineId, status);
        
        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        timeline.updateStatus(status);
        timeline = timelineRepository.save(timeline);
        
        return convertToDTO(timeline);
    }

    /**
     * Start timeline
     */
    @Transactional
    public TimelineDTO startTimeline(Long timelineId) {
        log.info("Starting timeline: {}", timelineId);
        
        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        timeline.setStatus(Timeline.TimelineStatus.ACTIVE);
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.STARTED)
                .description("Timeline started")
                .build());
        
        timeline = timelineRepository.save(timeline);
        
        return convertToDTO(timeline);
    }

    /**
     * Complete timeline
     */
    @Transactional
    public TimelineDTO completeTimeline(Long timelineId) {
        log.info("Completing timeline: {}", timelineId);
        
        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        timeline.setStatus(Timeline.TimelineStatus.COMPLETED);
        timeline.setProgressPercentage(BigDecimal.valueOf(100));
        timeline.addEvent(TimelineEvent.builder()
                .eventType(TimelineEvent.EventType.COMPLETED)
                .description("Timeline completed")
                .build());
        
        timeline = timelineRepository.save(timeline);
        
        return convertToDTO(timeline);
    }

    /**
     * Delete timeline
     */
    @Transactional
    public void deleteTimeline(Long timelineId) {
        log.info("Deleting timeline: {}", timelineId);
        
        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        timelineRepository.delete(timeline);
    }

    /**
     * Recalculate timeline progress
     */
    @Transactional
    public TimelineDTO recalculateProgress(Long timelineId) {
        log.info("Recalculating progress for timeline: {}", timelineId);
        
        Timeline timeline = timelineRepository.findById(timelineId)
                .orElseThrow(() -> new RuntimeException("Timeline not found: " + timelineId));
        
        // Calculate progress
        BigDecimal progress = progressService.calculateProgress(timelineId);
        timeline.setProgressPercentage(progress);
        
        // Check if on schedule
        boolean onSchedule = progressService.isOnSchedule(timelineId);
        timeline.setIsOnSchedule(onSchedule);
        
        // Calculate total delay
        int totalDelay = progressService.calculateTotalDelay(timelineId);
        timeline.setDelayMinutes(totalDelay);
        
        timeline = timelineRepository.save(timeline);
        
        return convertToDTO(timeline);
    }

    // ==================== Private Helper Methods ====================

    /**
     * Convert Timeline entity to DTO
     */
    private TimelineDTO convertToDTO(Timeline timeline) {
        return TimelineDTO.builder()
                .timelineId(timeline.getTimelineId())
                .journeyId(timeline.getJourneyId())
                .tripId(timeline.getTripId())
                .userId(timeline.getUserId())
                .currentCheckpointId(timeline.getCurrentCheckpointId())
                .progressPercentage(timeline.getProgressPercentage())
                .isOnSchedule(timeline.getIsOnSchedule())
                .delayMinutes(timeline.getDelayMinutes())
                .status(timeline.getStatus())
                .checkpoints(timeline.getCheckpoints().stream()
                        .map(this::convertCheckpointToDTO)
                        .collect(Collectors.toList()))
                .delays(timeline.getDelays().stream()
                        .map(this::convertDelayToDTO)
                        .collect(Collectors.toList()))
                .notifications(timeline.getNotifications().stream()
                        .map(this::convertNotificationToDTO)
                        .collect(Collectors.toList()))
                .createdAt(timeline.getCreatedAt())
                .lastUpdated(timeline.getLastUpdated())
                .build();
    }

    /**
     * Convert Checkpoint entity to DTO
     */
    private CheckpointDTO convertCheckpointToDTO(Checkpoint checkpoint) {
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

    /**
     * Convert Delay entity to DTO
     */
    private DelayDTO convertDelayToDTO(Delay delay) {
        return DelayDTO.builder()
                .delayId(delay.getDelayId())
                .checkpointId(delay.getCheckpoint() != null ? delay.getCheckpoint().getCheckpointId() : null)
                .delayType(delay.getDelayType())
                .delayMinutes(delay.getDelayMinutes())
                .reason(delay.getReason())
                .detectedAt(delay.getDetectedAt())
                .resolvedAt(delay.getResolvedAt())
                .isResolved(delay.getIsResolved())
                .build();
    }

    /**
     * Convert TimelineNotification entity to DTO
     */
    private NotificationDTO convertNotificationToDTO(TimelineNotification notification) {
        return NotificationDTO.builder()
                .notificationId(notification.getNotificationId())
                .checkpointId(notification.getCheckpoint() != null ? notification.getCheckpoint().getCheckpointId() : null)
                .notificationType(notification.getNotificationType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .isSent(notification.getIsSent())
                .scheduledFor(notification.getScheduledFor())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
