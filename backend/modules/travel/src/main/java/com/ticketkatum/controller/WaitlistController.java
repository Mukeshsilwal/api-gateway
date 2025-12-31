package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.Waitlist;
import com.ticketkatum.service.WaitlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
@Tag(name = "Waitlist", description = "Event waitlist management APIs")
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping
    @Operation(summary = "Join waitlist")
    public ResponseEntity<Response<Waitlist>> joinWaitlist(@RequestBody Map<String, Object> request) {
        try {
            Long eventId = Long.valueOf(request.get("eventId").toString());
            String email = (String) request.get("email");
            String name = request.get("name") != null ? (String) request.get("name") : null;

            Waitlist waitlist = waitlistService.joinWaitlist(eventId, email, name);
            return ResponseEntity.ok(Response.success("Added to waitlist successfully", waitlist));
        } catch (Exception e) {
            log.error("Error joining waitlist", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get waitlist by event")
    public ResponseEntity<Response<List<Waitlist>>> getWaitlist(@PathVariable Long eventId) {
        try {
            List<Waitlist> waitlist = waitlistService.getWaitlistByEvent(eventId);
            return ResponseEntity.ok(Response.success(waitlist));
        } catch (Exception e) {
            log.error("Error fetching waitlist", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}/stats")
    @Operation(summary = "Get waitlist statistics")
    public ResponseEntity<Response<Map<String, Object>>> getWaitlistStats(@PathVariable Long eventId) {
        try {
            Map<String, Object> stats = waitlistService.getWaitlistStats(eventId);
            return ResponseEntity.ok(Response.success(stats));
        } catch (Exception e) {
            log.error("Error fetching waitlist stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @PostMapping("/event/{eventId}/notify")
    @Operation(summary = "Notify waitlist members")
    public ResponseEntity<Response<Void>> notifyWaitlist(@PathVariable Long eventId) {
        try {
            waitlistService.notifyWaitlist(eventId);
            return ResponseEntity.ok(Response.success("Waitlist notified", null));
        } catch (Exception e) {
            log.error("Error notifying waitlist", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove from waitlist")
    public ResponseEntity<Response<Void>> removeFromWaitlist(@PathVariable Long id) {
        try {
            waitlistService.removeFromWaitlist(id);
            return ResponseEntity.ok(Response.success("Removed from waitlist", null));
        } catch (Exception e) {
            log.error("Error removing from waitlist", e);
            return ResponseEntity.badRequest()
                    .body(Response.error(400, e.getMessage()));
        }
    }
}
