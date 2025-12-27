package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimelineManagementService {

    private final WebClient.Builder webClientBuilder;

    @Value("${microservices.timeline-service-url:http://localhost:8088}")
    private String timelineServiceUrl;

    /**
     * Generate timeline for journey
     */
    public Mono<Map> generateTimeline(Long journeyId, Long tripId, Long userId) {
        return webClientBuilder.build()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path(timelineServiceUrl + "/api/timeline/generate/" + journeyId)
                        .queryParam("tripId", tripId)
                        .queryParam("userId", userId)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> getTimeline(Long journeyId) {
        return webClientBuilder.build()
                .get()
                .uri(timelineServiceUrl + "/api/timeline/" + journeyId) // Note: TimelineController uses
                                                                        // /api/timeline/{timelineId} OR
                                                                        // /journey/{journeyId}
                // Wait, frontend calls getTimeline(journeyId) which expects timeline for
                // journey.
                // Backend TimelineController has @GetMapping("/journey/{journeyId}")
                .retrieve()
                .bodyToMono(Map.class);
    }

    // Correct mapping for getTimeline by JourneyId used in frontend
    public Mono<Map> getTimelineByJourneyId(Long journeyId) {
        return webClientBuilder.build()
                .get()
                .uri(timelineServiceUrl + "/api/timeline/journey/" + journeyId)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> addCheckpoint(Long journeyId, Map<String, Object> checkpoint) {
        return webClientBuilder.build()
                .post()
                .uri(timelineServiceUrl + "/api/timeline/journey/" + journeyId + "/checkpoints")
                .bodyValue(checkpoint)
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Void> deleteCheckpoint(Long journeyId, Long checkpointId) {
        return webClientBuilder.build()
                .delete()
                .uri(timelineServiceUrl + "/api/timeline/journey/" + journeyId + "/checkpoints/" + checkpointId)
                .retrieve()
                .bodyToMono(Void.class);
    }
}
