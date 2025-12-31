package com.ticketkatum.controller;

import com.ticketkatum.service.SafetyAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bff/safety")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Safety BFF", description = "Backend-for-Frontend safety and SOS APIs")
public class SafetyBffController {

    private final SafetyAggregator safetyAggregator;

    @PostMapping("/sos/trigger")
    @Operation(summary = "Trigger SOS", description = "Initiate emergency protocol through BFF")
    public Mono<ResponseEntity<Map<String, Object>>> triggerSOS(@RequestBody Map<String, Object> sosData,
            Authentication authentication) {
        // Enforce user ID from token
        Long userId = extractUserId(authentication);
        sosData.put("userId", userId);

        log.info("SOS Triggered by user: {}", userId);
        return safetyAggregator.triggerSOS(sosData)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/sos/{sosId}/heartbeat")
    @Operation(summary = "SOS Heartbeat", description = "Update live location for active SOS")
    public Mono<ResponseEntity<Map<String, Object>>> sosHeartbeat(
            @PathVariable Long sosId,
            @RequestBody Map<String, Object> locationData) {
        return safetyAggregator.updateSOSHeartbeat(sosId, locationData)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active SOS", description = "Get any active SOS associated with the user")
    public Mono<ResponseEntity<List<Map<String, Object>>>> getActiveSOS(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return safetyAggregator.getActiveSOS(userId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/system/active")
    @Operation(summary = "Get all system active SOS", description = "Admin view of all ongoing emergencies")
    public Mono<ResponseEntity<List<Map<String, Object>>>> getSystemActiveSOS() {
        return safetyAggregator.getAllActiveSOS()
                .map(ResponseEntity::ok);
    }

    @GetMapping("/trip/{tripId}/status")
    @Operation(summary = "Get trip safety status", description = "Aggregated view of alerts and tracking")
    public Mono<ResponseEntity<Map<String, Object>>> getTripSafetyStatus(@PathVariable Long tripId) {
        return safetyAggregator.getTripSafetyStatus(tripId)
                .map(ResponseEntity::ok);
    }

    private Long extractUserId(Authentication authentication) {
        // Placeholder - in real system extracts from JWT
        return 1L;
    }
}
