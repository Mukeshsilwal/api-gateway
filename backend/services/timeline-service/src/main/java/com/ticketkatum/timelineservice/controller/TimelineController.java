package com.ticketkatum.timelineservice.controller;

import com.ticketkatum.timelineservice.dto.TimelineDTO;
import com.ticketkatum.timelineservice.entity.Timeline;
import com.ticketkatum.timelineservice.service.TimelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Timeline Management", description = "APIs for managing journey timelines")
public class TimelineController {

    private final TimelineService timelineService;

    /**
     * Generate timeline from journey
     */
    @PostMapping("/generate/{journeyId}")
    @Operation(summary = "Generate timeline", description = "Creates a new timeline from journey data")
    public ResponseEntity<TimelineDTO> generateTimeline(
            @PathVariable Long journeyId,
            @RequestParam Long tripId,
            @RequestParam Long userId) {
        
        log.info("Generating timeline for journey: {}", journeyId);
        TimelineDTO timeline = timelineService.generateTimeline(journeyId, tripId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeline);
    }

    /**
     * Get timeline by ID
     */
    @GetMapping("/{timelineId}")
    @Operation(summary = "Get timeline", description = "Retrieves timeline details by ID")
    public ResponseEntity<TimelineDTO> getTimeline(@PathVariable Long timelineId) {
        log.info("Fetching timeline: {}", timelineId);
        TimelineDTO timeline = timelineService.getTimeline(timelineId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Get timeline by journey ID
     */
    @GetMapping("/journey/{journeyId}")
    @Operation(summary = "Get timeline by journey", description = "Retrieves timeline for a specific journey")
    public ResponseEntity<TimelineDTO> getTimelineByJourneyId(@PathVariable Long journeyId) {
        log.info("Fetching timeline for journey: {}", journeyId);
        TimelineDTO timeline = timelineService.getTimelineByJourneyId(journeyId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Get all timelines for user
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user timelines", description = "Retrieves all timelines for a user")
    public ResponseEntity<List<TimelineDTO>> getUserTimelines(@PathVariable Long userId) {
        log.info("Fetching timelines for user: {}", userId);
        List<TimelineDTO> timelines = timelineService.getUserTimelines(userId);
        return ResponseEntity.ok(timelines);
    }

    /**
     * Get active timelines for user
     */
    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active timelines", description = "Retrieves active timelines for a user")
    public ResponseEntity<List<TimelineDTO>> getActiveTimelines(@PathVariable Long userId) {
        log.info("Fetching active timelines for user: {}", userId);
        List<TimelineDTO> timelines = timelineService.getActiveTimelines(userId);
        return ResponseEntity.ok(timelines);
    }

    /**
     * Update timeline status
     */
    @PutMapping("/{timelineId}/status")
    @Operation(summary = "Update status", description = "Updates timeline status")
    public ResponseEntity<TimelineDTO> updateTimelineStatus(
            @PathVariable Long timelineId,
            @RequestParam Timeline.TimelineStatus status) {
        
        log.info("Updating timeline {} status to: {}", timelineId, status);
        TimelineDTO timeline = timelineService.updateTimelineStatus(timelineId, status);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Start timeline
     */
    @PostMapping("/{timelineId}/start")
    @Operation(summary = "Start timeline", description = "Starts an active timeline")
    public ResponseEntity<TimelineDTO> startTimeline(@PathVariable Long timelineId) {
        log.info("Starting timeline: {}", timelineId);
        TimelineDTO timeline = timelineService.startTimeline(timelineId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Complete timeline
     */
    @PostMapping("/{timelineId}/complete")
    @Operation(summary = "Complete timeline", description = "Marks timeline as completed")
    public ResponseEntity<TimelineDTO> completeTimeline(@PathVariable Long timelineId) {
        log.info("Completing timeline: {}", timelineId);
        TimelineDTO timeline = timelineService.completeTimeline(timelineId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Recalculate progress
     */
    @PostMapping("/{timelineId}/recalculate")
    @Operation(summary = "Recalculate progress", description = "Recalculates timeline progress and delays")
    public ResponseEntity<TimelineDTO> recalculateProgress(@PathVariable Long timelineId) {
        log.info("Recalculating progress for timeline: {}", timelineId);
        TimelineDTO timeline = timelineService.recalculateProgress(timelineId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * Delete timeline
     */
    @DeleteMapping("/{timelineId}")
    @Operation(summary = "Delete timeline", description = "Deletes a timeline")
    public ResponseEntity<Void> deleteTimeline(@PathVariable Long timelineId) {
        log.info("Deleting timeline: {}", timelineId);
        timelineService.deleteTimeline(timelineId);
        return ResponseEntity.noContent().build();
    }
}
