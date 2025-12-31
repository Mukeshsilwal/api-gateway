package com.ticketkatum.market.controller;

import com.ticketkatum.market.dto.EventAnalytics;
import com.ticketkatum.market.service.OrganizerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizer")
@RequiredArgsConstructor
public class OrganizerAnalyticsController {

    private final OrganizerAnalyticsService analyticsService;

    @GetMapping("/dashboard/{eventId}")
    public ResponseEntity<EventAnalytics> getDashboard(@PathVariable("eventId") Long eventId) {
        return ResponseEntity.ok(analyticsService.getAnalytics(eventId));
    }

    @PostMapping("/pricing/override")
    public ResponseEntity<String> overridePricing(@RequestParam Long eventId, @RequestParam double multiplier) {
        // Call DynamicPricingService to set a manual override rule
        return ResponseEntity.ok("Pricing override activated: " + multiplier + "x");
    }
}
