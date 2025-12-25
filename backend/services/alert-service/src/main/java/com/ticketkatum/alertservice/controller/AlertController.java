package com.ticketkatum.alertservice.controller;

import com.ticketkatum.alertservice.dto.AlertDTO;
import com.ticketkatum.alertservice.dto.request.CreateAlertRequest;
import com.ticketkatum.alertservice.entity.Alert;
import com.ticketkatum.alertservice.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Alert Management", description = "APIs for managing alerts and notifications")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    @Operation(summary = "Create alert", description = "Create a new alert (admin only)")
    public ResponseEntity<AlertDTO> createAlert(
            @Valid @RequestBody CreateAlertRequest request,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        log.info("Creating alert by user: {}", userId);
        
        AlertDTO alert = alertService.createAlert(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(alert);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active alerts", description = "Get all currently active alerts")
    public ResponseEntity<List<AlertDTO>> getActiveAlerts() {
        log.info("Fetching active alerts");
        List<AlertDTO> alerts = alertService.getActiveAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/region/{region}")
    @Operation(summary = "Get alerts by region", description = "Get active alerts for a specific region")
    public ResponseEntity<List<AlertDTO>> getAlertsByRegion(@PathVariable("region") String region) {
        log.info("Fetching alerts for region: {}", region);
        List<AlertDTO> alerts = alertService.getAlertsByRegion(region);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/route/{route}")
    @Operation(summary = "Get alerts by route", description = "Get active alerts affecting a route")
    public ResponseEntity<List<AlertDTO>> getAlertsByRoute(@PathVariable("route") String route) {
        log.info("Fetching alerts for route: {}", route);
        List<AlertDTO> alerts = alertService.getAlertsByRoute(route);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/severity")
    @Operation(summary = "Get alerts by severity", description = "Get alerts filtered by severity levels")
    public ResponseEntity<List<AlertDTO>> getAlertsBySeverity(
            @RequestParam List<Alert.Severity> severities) {
        
        log.info("Fetching alerts by severities: {}", severities);
        List<AlertDTO> alerts = alertService.getAlertsBySeverity(severities);
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{alertId}/resolve")
    @Operation(summary = "Resolve alert", description = "Mark an alert as resolved (admin only)")
    public ResponseEntity<AlertDTO> resolveAlert(@PathVariable("alertId") Long alertId) {
        log.info("Resolving alert: {}", alertId);
        AlertDTO alert = alertService.resolveAlert(alertId);
        return ResponseEntity.ok(alert);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() != null) {
            return 1L; // Placeholder
        }
        throw new RuntimeException("User not authenticated");
    }
}
