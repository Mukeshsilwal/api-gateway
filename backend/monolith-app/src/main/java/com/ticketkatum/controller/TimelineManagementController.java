package com.ticketkatum.controller;

import com.ticketkatum.service.TimelineManagementService;
import com.ticketkatum.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/bff/timelines")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Timeline Management BFF", description = "BFF endpoints for timeline management")
public class TimelineManagementController {

    private final TimelineManagementService timelineManagementService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{journeyId}") // Match frontend expectation: getTimeline(journeyId) from timelineService.ts
                                // calls GET /{journeyId}
    @Operation(summary = "Get timeline", description = "Get timeline by journey ID")
    public Mono<ResponseEntity<Map>> getTimeline(@PathVariable("journeyId") Long journeyId) {
        log.info("BFF: Fetching timeline for journey: {}", journeyId);
        // Frontend expects timeline for a JOURNEY.
        // TimelineManagementService.getTimeline calls backend /api/timeline/{journeyId}
        // (Wait, check service implementation)
        // Check service: uri(timelineServiceUrl + "/api/timeline/" + journeyId)
        // Backend TimelineController has @GetMapping("/{timelineId}") AND
        // @GetMapping("/journey/{journeyId}")
        // IF journeyId is passed, backend might error if it expects timelineId at root
        // /api/timeline/{id}
        // BUT my service uses /api/timeline/{journeyId}.
        // If I want by Journey, I should use /api/timeline/journey/{journeyId} in
        // service.
        // I corrected this in TimelineManagementService.getTimelineByJourneyId, but
        // frontend calls getTimeline.

        // Let's assume for now the frontend passes journeyId and expects timeline.
        // Best to use the explicit "ByJourneyId" method in service if I can.
        return timelineManagementService.getTimelineByJourneyId(journeyId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/{journeyId}/checkpoints")
    @Operation(summary = "Add checkpoint", description = "Add a checkpoint to the timeline")
    public Mono<ResponseEntity<Map>> addCheckpoint(
            @PathVariable("journeyId") Long journeyId,
            @RequestBody Map<String, Object> checkpoint) {

        log.info("BFF: Adding checkpoint to journey: {}", journeyId);
        return timelineManagementService.addCheckpoint(journeyId, checkpoint)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{journeyId}/checkpoints/{checkpointId}")
    @Operation(summary = "Delete checkpoint", description = "Delete a checkpoint from the timeline")
    public Mono<ResponseEntity<Void>> deleteCheckpoint(
            @PathVariable("journeyId") Long journeyId,
            @PathVariable("checkpointId") Long checkpointId) {

        log.info("BFF: Deleting checkpoint: {} from journey: {}", checkpointId, journeyId);
        return timelineManagementService.deleteCheckpoint(journeyId, checkpointId)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
