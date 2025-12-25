package com.ticketkatum.sos.controller;

import com.ticketkatum.sos.dto.SafetyStatusRequest;
import com.ticketkatum.sos.entity.SafetyStatus;
import com.ticketkatum.sos.service.SosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/safety")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Safety Status", description = "APIs for Safety Check-ins and Status")
public class SafetyController {

    private final SosService sosService;

    @PostMapping("/checkin")
    @Operation(summary = "Check-in", description = "Update safety status (safe/unsafe)")
    public ResponseEntity<SafetyStatus> updateSafetyStatus(@Valid @RequestBody SafetyStatusRequest request) {
        log.info("Safety check-in for user: {}", request.getUserId());
        SafetyStatus status = sosService.updateSafetyStatus(request);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/status/{userId}")
    @Operation(summary = "Get status", description = "Get safety status for a user")
    public ResponseEntity<SafetyStatus> getSafetyStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(sosService.getSafetyStatus(userId));
    }
}
