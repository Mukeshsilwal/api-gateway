package com.ticketkatum.alertservice.controller;

import com.ticketkatum.alertservice.entity.SOSTrigger;
import com.ticketkatum.alertservice.service.SOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
@Slf4j
public class SOSController {

    private final SOSService sosService;

    @PostMapping("/trigger")
    public ResponseEntity<SOSTrigger> triggerSOS(@RequestBody Map<String, Object> data) {
        log.info("Received SOS trigger request");
        return ResponseEntity.ok(sosService.triggerSOS(data));
    }

    @PostMapping("/{sosId}/heartbeat")
    public ResponseEntity<SOSTrigger> heartbeat(@PathVariable Long sosId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(sosService.updateHeartbeat(sosId, data));
    }

    @GetMapping("/active/user/{userId}")
    public ResponseEntity<List<SOSTrigger>> getActiveSOS(@PathVariable Long userId) {
        return ResponseEntity.ok(sosService.getActiveSOSForUser(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SOSTrigger>> getSystemActiveSOS() {
        return ResponseEntity.ok(sosService.getAllActiveSOS());
    }
}
