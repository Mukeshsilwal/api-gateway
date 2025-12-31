package com.ticketkatum.controller;

import com.ticketkatum.dto.guide.GuideDTO;
import com.ticketkatum.service.BffGuideService;
import reactor.core.publisher.Mono;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bff/v1/guides")
@RequiredArgsConstructor
@Tag(name = "Guide Management", description = "Aggregated Guide APIs for Web")
public class BffGuideController {

    private final BffGuideService guideService;

    @GetMapping
    @Operation(summary = "Get All Guides", description = "Fetch all available guides")
    public Mono<ResponseEntity<List<GuideDTO>>> getAllGuides() {
        return guideService.getAllGuides()
                .collectList()
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{guideId}")
    @Operation(summary = "Get Guide Details", description = "Fetch specific guide details")
    public Mono<ResponseEntity<GuideDTO>> getGuide(@PathVariable Long guideId) {
        return guideService.getGuide(guideId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create Guide", description = "Register a new guide")
    public Mono<ResponseEntity<GuideDTO>> createGuide(@RequestBody GuideDTO guideDTO) {
        return guideService.createGuide(guideDTO)
                .map(guide -> ResponseEntity.status(HttpStatus.CREATED).body(guide));
    }

    @PatchMapping("/{guideId}/verify")
    @Operation(summary = "Verify Guide", description = "Approve guide profile (SUPER_ADMIN only)")
    public Mono<ResponseEntity<GuideDTO>> verifyGuide(
            @PathVariable Long guideId,
            @RequestParam Long verifiedBy) {
        return guideService.verifyGuide(guideId, verifiedBy)
                .map(ResponseEntity::ok);
    }

    @PatchMapping("/{guideId}/reject")
    @Operation(summary = "Reject Guide", description = "Reject guide profile with reason (SUPER_ADMIN only)")
    public Mono<ResponseEntity<GuideDTO>> rejectGuide(
            @PathVariable Long guideId,
            @RequestParam String reason,
            @RequestParam Long rejectedBy) {
        return guideService.rejectGuide(guideId, reason, rejectedBy)
                .map(ResponseEntity::ok);
    }

    @PatchMapping("/{guideId}/activate")
    @Operation(summary = "Activate Guide", description = "Activate guide profile")
    public Mono<ResponseEntity<GuideDTO>> activateGuide(@PathVariable Long guideId) {
        return guideService.activateGuide(guideId)
                .map(ResponseEntity::ok);
    }

    @PatchMapping("/{guideId}/deactivate")
    @Operation(summary = "Deactivate Guide", description = "Deactivate guide profile")
    public Mono<ResponseEntity<GuideDTO>> deactivateGuide(@PathVariable Long guideId) {
        return guideService.deactivateGuide(guideId)
                .map(ResponseEntity::ok);
    }
}
