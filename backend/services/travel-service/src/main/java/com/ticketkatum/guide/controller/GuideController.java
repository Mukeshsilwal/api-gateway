package com.ticketkatum.guide.controller;

import com.ticketkatum.guide.dto.*;
import com.ticketkatum.guide.service.GuideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/guides")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Guide Marketplace", description = "APIs for Guide Management, Packages, and Availability")
public class GuideController {

    private final GuideService guideService;

    @PostMapping
    @Operation(summary = "Register Guide", description = "Register a new guide profile")
    public ResponseEntity<GuideDTO> registerGuide(@Valid @RequestBody GuideDTO request) {
        log.info("Registering guide user: {}", request.getUserId());
        GuideDTO response = guideService.registerGuide(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get All Guides", description = "Get list of all registered guides")
    public ResponseEntity<List<GuideDTO>> getAllGuides() {
        return ResponseEntity.ok(guideService.getAllGuides());
    }

    @GetMapping("/{guideId}")
    @Operation(summary = "Get Guide", description = "Get guide profile by ID")
    public ResponseEntity<GuideDTO> getGuide(@PathVariable Long guideId) {
        return ResponseEntity.ok(guideService.getGuideProfile(guideId));
    }

    @PutMapping("/{guideId}")
    @Operation(summary = "Update Guide", description = "Update guide profile")
    public ResponseEntity<GuideDTO> updateGuide(@PathVariable Long guideId, @Valid @RequestBody GuideDTO request) {
        return ResponseEntity.ok(guideService.updateGuideProfile(guideId, request));
    }

    @GetMapping("/{guideId}/packages")
    @Operation(summary = "Get Packages", description = "Get service packages for a guide")
    public ResponseEntity<List<ServicePackageDTO>> getPackages(@PathVariable Long guideId) {
        return ResponseEntity.ok(guideService.getGuidePackages(guideId));
    }

    @PostMapping("/{guideId}/packages")
    @Operation(summary = "Add Package", description = "Add a new service package")
    public ResponseEntity<ServicePackageDTO> createPackage(
            @PathVariable Long guideId,
            @Valid @RequestBody ServicePackageDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guideService.createPackage(guideId, request));
    }

    @GetMapping("/{guideId}/availability")
    @Operation(summary = "Get Availability", description = "Get guide availability calendar")
    public ResponseEntity<List<AvailabilityDTO>> getAvailability(
            @PathVariable Long guideId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(guideService.getAvailability(guideId, from, to));
    }

    @PostMapping("/{guideId}/availability")
    @Operation(summary = "Set Availability", description = "Set availability for a specific date")
    public ResponseEntity<AvailabilityDTO> setAvailability(
            @PathVariable Long guideId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String status) {
        return ResponseEntity.ok(guideService.setAvailability(guideId, date, status));
    }

    @PatchMapping("/{guideId}/verify")
    @Operation(summary = "Verify Guide", description = "Approve guide profile (SUPER_ADMIN only)")
    public ResponseEntity<GuideDTO> verifyGuide(
            @PathVariable Long guideId,
            @RequestParam Long verifiedBy) {
        return ResponseEntity.ok(guideService.verifyGuide(guideId, verifiedBy));
    }

    @PatchMapping("/{guideId}/reject")
    @Operation(summary = "Reject Guide", description = "Reject guide profile with reason (SUPER_ADMIN only)")
    public ResponseEntity<GuideDTO> rejectGuide(
            @PathVariable Long guideId,
            @RequestParam String reason,
            @RequestParam Long rejectedBy) {
        return ResponseEntity.ok(guideService.rejectGuide(guideId, reason, rejectedBy));
    }

    @PatchMapping("/{guideId}/activate")
    @Operation(summary = "Activate Guide", description = "Activate guide profile")
    public ResponseEntity<GuideDTO> activateGuide(@PathVariable Long guideId) {
        return ResponseEntity.ok(guideService.activateGuide(guideId));
    }

    @PatchMapping("/{guideId}/deactivate")
    @Operation(summary = "Deactivate Guide", description = "Deactivate guide profile")
    public ResponseEntity<GuideDTO> deactivateGuide(@PathVariable Long guideId) {
        return ResponseEntity.ok(guideService.deactivateGuide(guideId));
    }
}
