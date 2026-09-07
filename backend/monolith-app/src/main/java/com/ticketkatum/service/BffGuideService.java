package com.ticketkatum.service;

import com.ticketkatum.client.GuideServiceClient;
import com.ticketkatum.dto.guide.GuideDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class BffGuideService {

    private final GuideServiceClient guideServiceClient;

    public Flux<GuideDTO> getAllGuides() {
        return guideServiceClient.getAllGuides()
                .onErrorResume(e -> {
                    log.error("Error fetching guides from guide-service", e);
                    return Flux.empty();
                });
    }

    public Mono<GuideDTO> getGuide(Long guideId) {
        return guideServiceClient.getGuide(guideId)
                .onErrorResume(e -> {
                    log.error("Error fetching guide details for id: {}", guideId, e);
                    return Mono.empty();
                });
    }

    public Mono<GuideDTO> createGuide(GuideDTO guideDTO) {
        return guideServiceClient.createGuide(guideDTO)
                .onErrorResume(e -> {
                    log.error("Error creating guide", e);
                    String msg = e.getMessage();
                    if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                        org.springframework.web.reactive.function.client.WebClientResponseException we =
                                (org.springframework.web.reactive.function.client.WebClientResponseException) e;
                        String body = we.getResponseBodyAsString();
                        if (body != null && !body.isBlank()) {
                            msg = body;
                        }
                    }
                    return Mono.error(new RuntimeException("Failed to create guide: " + msg, e));
                });
    }

    public Mono<GuideDTO> verifyGuide(Long guideId, Long verifiedBy) {
        return guideServiceClient.verifyGuide(guideId, verifiedBy)
                .onErrorResume(e -> {
                    log.error("Error verifying guide: {}", guideId, e);
                    return Mono.error(new RuntimeException("Failed to verify guide", e));
                });
    }

    public Mono<GuideDTO> rejectGuide(Long guideId, String reason, Long rejectedBy) {
        return guideServiceClient.rejectGuide(guideId, reason, rejectedBy)
                .onErrorResume(e -> {
                    log.error("Error rejecting guide: {}", guideId, e);
                    return Mono.error(new RuntimeException("Failed to reject guide", e));
                });
    }

    public Mono<GuideDTO> activateGuide(Long guideId) {
        return guideServiceClient.activateGuide(guideId)
                .onErrorResume(e -> {
                    log.error("Error activating guide: {}", guideId, e);
                    return Mono.error(new RuntimeException("Failed to activate guide", e));
                });
    }

    public Mono<GuideDTO> deactivateGuide(Long guideId) {
        return guideServiceClient.deactivateGuide(guideId)
                .onErrorResume(e -> {
                    log.error("Error deactivating guide: {}", guideId, e);
                    return Mono.error(new RuntimeException("Failed to deactivate guide", e));
                });
    }
}
