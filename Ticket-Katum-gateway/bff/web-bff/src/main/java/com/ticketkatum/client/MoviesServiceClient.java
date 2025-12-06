package com.ticketkatum.client;

import com.ticketkatum.config.WebClientInvoker;
import com.ticketkatum.dto.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class MoviesServiceClient extends WebClientInvoker {

    @Qualifier("moviesWebClient")
    @Autowired
    private WebClient webClient;

    private static final String SERVICE = "moviesService";

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackSearch")
    @Retry(name = SERVICE)
    public Mono<GenericResponse<MovieSearchResponse>> searchMovies(
            GenericRequest<MovieSearchRequest> request) {

        return invoke(
                webClient.post()
                        .uri("/api/movies/search")
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<MovieSearchResponse>>() {}),
                SERVICE,
                "searchMovies"
        );
    }

    @CircuitBreaker(name = SERVICE, fallbackMethod = "fallbackRecommendations")
    @Retry(name = SERVICE)
    @Cacheable(value = "movie-recommendations", key = "#latitude + '_' + #longitude")
    public Mono<List<MovieRecommendation>> getNearbyMovies(
            Double latitude, Double longitude, Integer limit) {

        return invoke(
                webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/movies/nearby")
                                .queryParam("latitude", latitude)
                                .queryParam("longitude", longitude)
                                .queryParam("limit", limit)
                                .build())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<
                                GenericResponse<List<MovieRecommendation>>>() {}),
                SERVICE,
                "getNearbyMovies"
        ).map(response -> response.isSuccess() && response.getData() != null ?
                response.getData() : Collections.emptyList());
    }

    // Fallback methods
    private Mono<GenericResponse<MovieSearchResponse>> fallbackSearch(
            GenericRequest<MovieSearchRequest> req, Throwable ex) {

        log.warn("Movies search fallback triggered | error={}", ex.getMessage());

        return Mono.just(GenericResponse.success(
                MovieSearchResponse.builder()
                        .movies(Collections.emptyList())
                        .totalResults(0)
                        .message("Movie search temporarily unavailable")
                        .build(),
                req.getRequestId()
        ));
    }

    private Mono<List<MovieRecommendation>> fallbackRecommendations(
            Double latitude, Double longitude, Integer limit, Throwable ex) {

        log.warn("Movie recommendations fallback triggered | error={}", ex.getMessage());

        return Mono.just(Collections.emptyList());
    }
}