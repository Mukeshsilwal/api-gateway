package com.ticketkatum.service;

import com.ticketkatum.service.PersonalizationService;
import com.ticketkatum.service.TripAggregationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TripAggregationServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private PersonalizationService personalizationService;

    @InjectMocks
    private TripAggregationService tripAggregationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tripAggregationService, "tripServiceUrl", "http://trip-service");
        ReflectionTestUtils.setField(tripAggregationService, "bookingServiceUrl", "http://booking-service");
        ReflectionTestUtils.setField(tripAggregationService, "trackingServiceUrl", "http://tracking-service");
        ReflectionTestUtils.setField(tripAggregationService, "alertServiceUrl", "http://alert-service");
    }

    @Test
    void getTripDashboard_Success() {
        WebClient webClient = mock(WebClient.class);
        when(webClientBuilder.build()).thenReturn(webClient);

        WebClient.RequestHeadersUriSpec requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);

        // Mock Trip Details response
        WebClient.RequestHeadersSpec reqDetails = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec respDetails = mock(WebClient.ResponseSpec.class);
        when(requestHeadersUriSpec.uri(contains("/details"))).thenReturn(reqDetails);
        when(reqDetails.retrieve()).thenReturn(respDetails);
        when(respDetails.bodyToMono(any(ParameterizedTypeReference.class)))
                .thenReturn(Mono.just(Map.of("tripId", 1, "name", "Test Trip")));

        // Mock Bookings response
        WebClient.RequestHeadersSpec reqBookings = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec respBookings = mock(WebClient.ResponseSpec.class);
        when(requestHeadersUriSpec.uri(contains("/bookings/trip"))).thenReturn(reqBookings);
        when(reqBookings.retrieve()).thenReturn(respBookings);
        when(respBookings.bodyToFlux(any(ParameterizedTypeReference.class)))
                .thenReturn(Flux.just(
                        Map.of("id", 100, "status", "CONFIRMED"),
                        Map.of("id", 101, "status", "PENDING")));

        // Mock Tracking response
        WebClient.RequestHeadersSpec reqTracking = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec respTracking = mock(WebClient.ResponseSpec.class);
        when(requestHeadersUriSpec.uri(contains("/tracking/trip"))).thenReturn(reqTracking);
        when(reqTracking.retrieve()).thenReturn(respTracking);
        when(respTracking.bodyToFlux(any(ParameterizedTypeReference.class)))
                .thenReturn(Flux.empty());

        // Mock Alerts response
        WebClient.RequestHeadersSpec reqAlerts = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec respAlerts = mock(WebClient.ResponseSpec.class);
        when(requestHeadersUriSpec.uri(contains("/alerts/active"))).thenReturn(reqAlerts);
        when(reqAlerts.retrieve()).thenReturn(respAlerts);
        when(respAlerts.bodyToFlux(any(ParameterizedTypeReference.class)))
                .thenReturn(Flux.empty());

        // Mock Recommendations
        when(personalizationService.getTripRecommendations(any(), any())).thenReturn(List.of());

        // Execute
        Mono<Map<String, Object>> result = tripAggregationService.getTripDashboard(1L);

        // Verify
        StepVerifier.create(result)
                .expectNextMatches(dashboard -> {
                    Map<String, Object> bookingSummary = (Map<String, Object>) dashboard.get("bookingSummary");
                    return bookingSummary != null &&
                            (long) bookingSummary.get("total") == 2 &&
                            (long) bookingSummary.get("confirmed") == 1 &&
                            (long) bookingSummary.get("pending") == 1;
                })
                .verifyComplete();
    }
}
