package com.ticketkatum.controller;

import com.ticketkatum.dto.admin.DashboardSearchResponse;
import com.ticketkatum.dto.admin.DashboardSummaryDto;
import com.ticketkatum.service.AdminAggregator;
import com.ticketkatum.service.LiveTrackingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

@WebFluxTest(AdminBffController.class)
@WithMockUser(roles = "ADMIN")
class AdminBffControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private AdminAggregator adminAggregator;

    @MockBean
    private LiveTrackingService liveTrackingService;

    @Test
    void getDashboardSummary_ShouldReturnSummary() {
        DashboardSummaryDto mockSummary = DashboardSummaryDto.builder()
                .totals(DashboardSummaryDto.Totals.builder().buses(10).build())
                .revenueSeries(Collections.emptyList())
                .build();

        given(adminAggregator.getDashboardSummary(anyString(), anyString()))
                .willReturn(CompletableFuture.completedFuture(mockSummary));

        webTestClient.get()
                .uri("/api/bff/v1/admin/summary")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data.totals.buses").isEqualTo(10);
    }

    @Test
    void getBusStream_ShouldReturnSseStream() {
        LiveTrackingService.LiveTrackingPayload payload = LiveTrackingService.LiveTrackingPayload.builder()
                .activeBuses(5)
                .buses(Collections.emptyList())
                .build();

        given(liveTrackingService.getBusLocationStream())
                .willReturn(Flux.just(payload));

        webTestClient.get()
                .uri("/api/bff/v1/admin/live/buses/stream")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM);
    }

    @Test
    void globalSearch_ShouldReturnResults() {
        DashboardSearchResponse mockResponse = DashboardSearchResponse.builder()
                .items(List.of(
                        DashboardSearchResponse.SearchItem.builder().id("1").title("Bus 1").build()))
                .build();

        given(adminAggregator.globalSearch(anyString(), anyString()))
                .willReturn(CompletableFuture.completedFuture(mockResponse));

        webTestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/bff/v1/admin/search")
                        .queryParam("q", "bus")
                        .build())
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data.items[0].title").isEqualTo("Bus 1");
    }
}
