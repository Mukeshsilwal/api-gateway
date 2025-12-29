package com.ticketkatum.controller;

import com.ticketkatum.dto.RecommendationRequest;
import com.ticketkatum.dto.RecommendationResponse;
import com.ticketkatum.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/recommendations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Recommendations", description = "AI-powered trip recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    @Operation(summary = "Generate Recommendations", description = "Get personalized trip suggestions based on preferences")
    public ResponseEntity<RecommendationResponse> getRecommendations(@RequestBody RecommendationRequest request) {
        log.info("Received recommendation request for user: {}", request.getUserId());
        return ResponseEntity.ok(recommendationService.generateRecommendations(request));
    }
}
