package com.ticketkatum.journeyservice.controller;

import com.ticketkatum.journeyservice.dto.*;
import com.ticketkatum.journeyservice.entity.Journey;
import com.ticketkatum.journeyservice.service.JourneyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journey")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Journey Management", description = "APIs for managing journeys")
public class JourneyController {

    private final JourneyService journeyService;

    /**
     * Generate journey from trip
     */
    @PostMapping("/generate")
    @Operation(summary = "Generate journey from trip", description = "Creates a new journey based on trip data and existing bookings")
    public ResponseEntity<JourneyDTO> generateJourney(
            @RequestParam Long tripId,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.info("Generating journey for trip: {} and user: {}", tripId, userId);
        JourneyDTO journey = journeyService.generateJourney(tripId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(journey);
    }

    /**
     * Get journey by ID
     */
    @GetMapping("/{journeyId}")
    @Operation(summary = "Get journey details", description = "Retrieves complete journey information including segments and suggestions")
    public ResponseEntity<JourneyDTO> getJourney(@PathVariable Long journeyId) {
        log.info("Fetching journey: {}", journeyId);
        JourneyDTO journey = journeyService.getJourney(journeyId);
        return ResponseEntity.ok(journey);
    }

    /**
     * Get journey by trip ID
     */
    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get journey by trip ID", description = "Retrieves journey associated with a specific trip")
    public ResponseEntity<JourneyDTO> getJourneyByTripId(@PathVariable Long tripId) {
        log.info("Fetching journey for trip: {}", tripId);
        JourneyDTO journey = journeyService.getJourneyByTripId(tripId);
        return ResponseEntity.ok(journey);
    }

    /**
     * Get all journeys for user
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user journeys", description = "Retrieves all journeys for a specific user")
    public ResponseEntity<List<JourneyDTO>> getUserJourneys(@PathVariable Long userId) {
        log.info("Fetching journeys for user: {}", userId);
        List<JourneyDTO> journeys = journeyService.getUserJourneys(userId);
        return ResponseEntity.ok(journeys);
    }

    /**
     * Get active journeys for user
     */
    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active journeys", description = "Retrieves active (planned or in-progress) journeys for a user")
    public ResponseEntity<List<JourneyDTO>> getActiveJourneys(@PathVariable Long userId) {
        log.info("Fetching active journeys for user: {}", userId);
        List<JourneyDTO> journeys = journeyService.getActiveJourneys(userId);
        return ResponseEntity.ok(journeys);
    }

    /**
     * Update journey status
     */
    @PutMapping("/{journeyId}/status")
    @Operation(summary = "Update journey status", description = "Updates the status of a journey")
    public ResponseEntity<JourneyDTO> updateJourneyStatus(
            @PathVariable Long journeyId,
            @RequestParam Journey.JourneyStatus status) {
        
        log.info("Updating journey {} status to: {}", journeyId, status);
        JourneyDTO journey = journeyService.updateJourneyStatus(journeyId, status);
        return ResponseEntity.ok(journey);
    }

    /**
     * Add segment to journey
     */
    @PostMapping("/{journeyId}/segments")
    @Operation(summary = "Add segment", description = "Adds a new segment to the journey")
    public ResponseEntity<SegmentDTO> addSegment(
            @PathVariable Long journeyId,
            @Valid @RequestBody CreateSegmentRequest request) {
        
        log.info("Adding segment to journey: {}", journeyId);
        SegmentDTO segment = journeyService.addSegment(journeyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(segment);
    }

    /**
     * Update segment
     */
    @PutMapping("/segments/{segmentId}")
    @Operation(summary = "Update segment", description = "Updates an existing journey segment")
    public ResponseEntity<SegmentDTO> updateSegment(
            @PathVariable Long segmentId,
            @Valid @RequestBody UpdateSegmentRequest request) {
        
        log.info("Updating segment: {}", segmentId);
        SegmentDTO segment = journeyService.updateSegment(segmentId, request);
        return ResponseEntity.ok(segment);
    }

    /**
     * Delete segment
     */
    @DeleteMapping("/segments/{segmentId}")
    @Operation(summary = "Delete segment", description = "Removes a segment from the journey")
    public ResponseEntity<Void> deleteSegment(@PathVariable Long segmentId) {
        log.info("Deleting segment: {}", segmentId);
        journeyService.deleteSegment(segmentId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete journey
     */
    @DeleteMapping("/{journeyId}")
    @Operation(summary = "Delete journey", description = "Deletes a journey and all its segments")
    public ResponseEntity<Void> deleteJourney(@PathVariable Long journeyId) {
        log.info("Deleting journey: {}", journeyId);
        journeyService.deleteJourney(journeyId);
        return ResponseEntity.noContent().build();
    }
}
