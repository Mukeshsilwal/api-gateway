package com.ticketkatum.client;

import com.ticketkatum.dto.guide.GuideDTO;
import com.ticketkatum.config.ServiceUrlConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuideServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrlConfig;

    public Flux<GuideDTO> getAllGuides() {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .get()
                .uri("/api/guides")
                .retrieve()
                .bodyToFlux(GuideDTO.class);
    }

    public Mono<GuideDTO> getGuide(Long guideId) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .get()
                .uri("/api/guides/" + guideId)
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }

    public Mono<GuideDTO> createGuide(GuideDTO guideDTO) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .post()
                .uri("/api/guides")
                .bodyValue(guideDTO)
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }

    public Mono<GuideDTO> verifyGuide(Long guideId, Long verifiedBy) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .patch()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/guides/{guideId}/verify")
                        .queryParam("verifiedBy", verifiedBy)
                        .build(guideId))
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }

    public Mono<GuideDTO> rejectGuide(Long guideId, String reason, Long rejectedBy) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .patch()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/guides/{guideId}/reject")
                        .queryParam("reason", reason)
                        .queryParam("rejectedBy", rejectedBy)
                        .build(guideId))
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }

    public Mono<GuideDTO> activateGuide(Long guideId) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .patch()
                .uri("/api/guides/{guideId}/activate", guideId)
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }

    public Mono<GuideDTO> deactivateGuide(Long guideId) {
        return webClientBuilder.baseUrl(serviceUrlConfig.getGuideServiceUrl()).build()
                .patch()
                .uri("/api/guides/{guideId}/deactivate", guideId)
                .retrieve()
                .bodyToMono(GuideDTO.class);
    }
}
