package com.ticketkatum.sos.controller;

import com.ticketkatum.sos.dto.SafetyStatusRequest;
import com.ticketkatum.sos.entity.SafetyStatus;
import com.ticketkatum.sos.service.SosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/safety")
@RequiredArgsConstructor
@Slf4j
public class SafetyController {

    private final SosService sosService;

    @PostMapping("/checkin")
    public ResponseEntity<SafetyStatus> updateSafetyStatus(@Valid @RequestBody SafetyStatusRequest request) {
        log.info("Safety check-in for user: {}", request.getUserId());
        SafetyStatus status = sosService.updateSafetyStatus(request);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<SafetyStatus> getSafetyStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(sosService.getSafetyStatus(userId));
    }
}
