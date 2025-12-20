package com.ticketkatum.market.controller;

import com.ticketkatum.market.domain.CrowdZone;
import com.ticketkatum.market.service.CrowdFlowService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crowd")
@RequiredArgsConstructor
public class CrowdController {

    private final CrowdFlowService crowdService;

    @PostMapping("/zones")
    public ResponseEntity<CrowdZone> createZone(@RequestBody CrowdZone zone) {
        return ResponseEntity.ok(crowdService.createZone(zone));
    }

    @GetMapping("/heatmap/{eventId}")
    public ResponseEntity<List<CrowdZone>> getHeatmap(@PathVariable("eventId") Long eventId) {
        return ResponseEntity.ok(crowdService.getHeatmap(eventId));
    }

    @PostMapping("/scan")
    public ResponseEntity<CrowdZone> recordScan(@RequestBody ScanRequest request) {
        return ResponseEntity.ok(crowdService.recordScan(request.getZoneId(), request.getDirection()));
    }

    @Data
    public static class ScanRequest {
        private UUID zoneId;
        private String direction; // "IN" or "OUT"
    }
}
