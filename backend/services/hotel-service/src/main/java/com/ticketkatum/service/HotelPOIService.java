package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelPOIService {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.tracking-service.url:http://localhost:8088/tracking-service}")
    private String trackingServiceUrl;

    /**
     * Get nearby POIs for a hotel
     */
    public Mono<List<Map>> getNearbyPOIs(Double latitude, Double longitude, Double radiusKm) {
        log.debug("Fetching POIs near hotel at ({}, {}) within {} km", latitude, longitude, radiusKm);

        return webClientBuilder.build()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("http")
                        .host(extractHost(trackingServiceUrl))
                        .port(extractPort(trackingServiceUrl))
                        .path(extractPath(trackingServiceUrl) + "/api/poi/nearby")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("radiusKm", radiusKm != null ? radiusKm : 5.0)
                        .build())
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .doOnSuccess(pois -> log.debug("Found {} POIs near hotel", pois.size()))
                .doOnError(e -> log.error("Failed to fetch nearby POIs", e))
                .onErrorReturn(null);
    }

    /**
     * Get POIs by category near hotel
     */
    public Mono<List<Map>> getPOIsByCategory(String category, Double latitude,
            Double longitude, Double radiusKm) {
        log.debug("Fetching {} POIs near hotel", category);

        return getNearbyPOIs(latitude, longitude, radiusKm)
                .map(pois -> pois.stream()
                        .filter(poi -> category.equals(poi.get("category")))
                        .toList());
    }

    private String extractHost(String url) {
        try {
            return url.split("://")[1].split(":")[0];
        } catch (Exception e) {
            return "localhost";
        }
    }

    private int extractPort(String url) {
        try {
            String portStr = url.split(":")[2].split("/")[0];
            return Integer.parseInt(portStr);
        } catch (Exception e) {
            return 8088;
        }
    }

    private String extractPath(String url) {
        try {
            int idx = url.indexOf('/', url.indexOf("://") + 3);
            return idx > 0 ? url.substring(idx) : "";
        } catch (Exception e) {
            return "/tracking-service";
        }
    }
}
