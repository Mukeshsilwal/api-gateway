package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Check-in Controller
 * REST API for attendee check-in
 */
@Slf4j
@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
@Tag(name = "Check-in", description = "Attendee check-in APIs")
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    @Operation(summary = "Check in attendee")
    public ResponseEntity<Response<Map<String, Object>>> checkIn(@RequestBody Map<String, String> checkInData) {
        try {
            String qrCode = checkInData.get("qrCode");
            String checkedInBy = checkInData.get("checkedInBy");
            String location = checkInData.get("location");

            Map<String, Object> result = checkInService.checkIn(qrCode, checkedInBy, location);
            return ResponseEntity.ok(Response.success(result));
        } catch (Exception e) {
            log.error("Error during check-in", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/stats/{eventId}")
    @Operation(summary = "Get check-in statistics")
    public ResponseEntity<Response<Map<String, Object>>> getCheckInStats(@PathVariable("eventId") Long eventId) {
        try {
            Map<String, Object> stats = checkInService.getCheckInStats(eventId);
            return ResponseEntity.ok(Response.success(stats));
        } catch (Exception e) {
            log.error("Error fetching check-in stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }
}
