package com.ticketkatum.timelineservice.controller;

import com.ticketkatum.timelineservice.dto.CheckpointDTO;
import com.ticketkatum.timelineservice.dto.CreateCheckpointRequest;
import com.ticketkatum.timelineservice.service.CheckpointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Checkpoint Management", description = "APIs for managing timeline checkpoints")
public class CheckpointController {

    private final CheckpointService checkpointService;

    /**
     * Add checkpoint to timeline
     */
    @PostMapping("/{timelineId}/checkpoints")
    @Operation(summary = "Add checkpoint", description = "Adds a new checkpoint to the timeline")
    public ResponseEntity<CheckpointDTO> addCheckpoint(
            @PathVariable Long timelineId,
            @Valid @RequestBody CreateCheckpointRequest request) {
        
        log.info("Adding checkpoint to timeline: {}", timelineId);
        CheckpointDTO checkpoint = checkpointService.addCheckpoint(timelineId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(checkpoint);
    }

    /**
     * Mark checkpoint as reached
     */
    @PostMapping("/checkpoints/{checkpointId}/reach")
    @Operation(summary = "Mark checkpoint reached", description = "Marks a checkpoint as reached")
    public ResponseEntity<CheckpointDTO> markCheckpointReached(@PathVariable Long checkpointId) {
        log.info("Marking checkpoint {} as reached", checkpointId);
        CheckpointDTO checkpoint = checkpointService.markCheckpointReached(checkpointId);
        return ResponseEntity.ok(checkpoint);
    }

    /**
     * Skip checkpoint
     */
    @PostMapping("/checkpoints/{checkpointId}/skip")
    @Operation(summary = "Skip checkpoint", description = "Skips a checkpoint")
    public ResponseEntity<CheckpointDTO> skipCheckpoint(@PathVariable Long checkpointId) {
        log.info("Skipping checkpoint: {}", checkpointId);
        CheckpointDTO checkpoint = checkpointService.skipCheckpoint(checkpointId);
        return ResponseEntity.ok(checkpoint);
    }

    /**
     * Update checkpoint ETA
     */
    @PutMapping("/checkpoints/{checkpointId}/eta")
    @Operation(summary = "Update ETA", description = "Updates checkpoint estimated arrival time")
    public ResponseEntity<CheckpointDTO> updateCheckpointETA(
            @PathVariable Long checkpointId,
            @RequestParam LocalDateTime eta) {
        
        log.info("Updating checkpoint {} ETA to: {}", checkpointId, eta);
        CheckpointDTO checkpoint = checkpointService.updateCheckpointETA(checkpointId, eta);
        return ResponseEntity.ok(checkpoint);
    }

    /**
     * Get current checkpoint
     */
    @GetMapping("/{timelineId}/current")
    @Operation(summary = "Get current checkpoint", description = "Gets the current checkpoint in progress")
    public ResponseEntity<CheckpointDTO> getCurrentCheckpoint(@PathVariable Long timelineId) {
        log.info("Getting current checkpoint for timeline: {}", timelineId);
        CheckpointDTO checkpoint = checkpointService.getCurrentCheckpoint(timelineId);
        return checkpoint != null ? ResponseEntity.ok(checkpoint) : ResponseEntity.noContent().build();
    }

    /**
     * Get next checkpoint
     */
    @GetMapping("/{timelineId}/next")
    @Operation(summary = "Get next checkpoint", description = "Gets the next pending checkpoint")
    public ResponseEntity<CheckpointDTO> getNextCheckpoint(@PathVariable Long timelineId) {
        log.info("Getting next checkpoint for timeline: {}", timelineId);
        CheckpointDTO checkpoint = checkpointService.getNextCheckpoint(timelineId);
        return checkpoint != null ? ResponseEntity.ok(checkpoint) : ResponseEntity.noContent().build();
    }

    /**
     * Get upcoming checkpoints
     */
    @GetMapping("/{timelineId}/upcoming")
    @Operation(summary = "Get upcoming checkpoints", description = "Gets upcoming checkpoints")
    public ResponseEntity<List<CheckpointDTO>> getUpcomingCheckpoints(
            @PathVariable Long timelineId,
            @RequestParam(defaultValue = "5") int limit) {
        
        log.info("Getting upcoming checkpoints for timeline: {}", timelineId);
        List<CheckpointDTO> checkpoints = checkpointService.getUpcomingCheckpoints(timelineId, limit);
        return ResponseEntity.ok(checkpoints);
    }

    /**
     * Delete checkpoint
     */
    @DeleteMapping("/checkpoints/{checkpointId}")
    @Operation(summary = "Delete checkpoint", description = "Deletes a checkpoint")
    public ResponseEntity<Void> deleteCheckpoint(@PathVariable Long checkpointId) {
        log.info("Deleting checkpoint: {}", checkpointId);
        checkpointService.deleteCheckpoint(checkpointId);
        return ResponseEntity.noContent().build();
    }
}
