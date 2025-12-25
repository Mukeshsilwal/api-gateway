package com.ticketkatum.timelineservice.controller;

import com.ticketkatum.timelineservice.dto.ProgressDTO;
import com.ticketkatum.timelineservice.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Progress Tracking", description = "APIs for tracking timeline progress")
public class ProgressController {

    private final ProgressService progressService;

    /**
     * Get progress details
     */
    @GetMapping("/{timelineId}/progress")
    @Operation(summary = "Get progress", description = "Gets detailed progress information for a timeline")
    public ResponseEntity<ProgressDTO> getProgress(@PathVariable Long timelineId) {
        log.info("Getting progress for timeline: {}", timelineId);
        ProgressDTO progress = progressService.getProgressDetails(timelineId);
        return ResponseEntity.ok(progress);
    }
}
