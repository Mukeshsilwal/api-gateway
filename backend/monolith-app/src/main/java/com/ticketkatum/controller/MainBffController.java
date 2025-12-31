package com.ticketkatum.controller;

import com.ticketkatum.dto.*;
import com.ticketkatum.dto.auth.CompleteUserProfile;
import com.ticketkatum.dto.booking.response.BookingHistoryResponse;
import com.ticketkatum.dto.payment.PaymentProviderDTO;
import com.ticketkatum.dto.payment.response.PaymentProvider;
import com.ticketkatum.service.AuthAggregator;
import com.ticketkatum.service.BookingAggregator;
import com.ticketkatum.service.HotelAggregator;
import com.ticketkatum.service.PaymentAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Main BFF Controller
 * Provides cross-domain aggregated endpoints
 * Coordinates multiple aggregators for complex operations
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1")
@RequiredArgsConstructor
@Tag(name = "Main BFF", description = "Cross-domain aggregated APIs")
public class MainBffController {

        private final HotelAggregator hotelAggregator;
        private final AuthAggregator authAggregator;
        private final BookingAggregator bookingAggregator;
        private final PaymentAggregator paymentAggregator;

        /**
         * Get complete home page data
         * Aggregates: hotels, auth status, featured content
         */
        @GetMapping("/home-data")
        @Operation(summary = "Get home page data", description = "Returns all data needed for home page rendering")
        public CompletableFuture<ResponseEntity<Response<CompleteHomePageData>>> getCompleteHomePageData(
                        @RequestHeader(value = "X-User-Id", required = false) String userId,
                        @RequestHeader(value = "Username", required = false) String username,
                        @RequestParam(required = false) Double lat,
                        @RequestParam(required = false) Double lon) {

                log.info("BFF: Fetching complete home page data for user: {}", userId);

                // Parallel fetch from multiple aggregators
                CompletableFuture<HomePageData> hotelDataFuture = hotelAggregator.getHomePageData(userId, lat, lon);

                // CompletableFuture<Long> onlineCountFuture =
                // authAggregator.getUserActivitySummary();

                CompletableFuture<List<PaymentProviderDTO>> providersFuture = paymentAggregator.getAvailableProviders();

                return CompletableFuture.allOf(hotelDataFuture, providersFuture)
                                .thenApply(v -> {
                                        CompleteHomePageData data = CompleteHomePageData.builder()
                                                        .hotelData(hotelDataFuture.join())
                                                        // .onlineUserCount(onlineCountFuture.join())
                                                        .paymentProviders(providersFuture.join())
                                                        .isAuthenticated(userId != null)
                                                        .build();

                                        return ResponseEntity.ok(
                                                        new Response<>(200, "Home page data retrieved", data));
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching home page data", ex);
                                        return ResponseEntity.status(500).body(
                                                        new Response<>(500, "Home page fetch failed", null));
                                });
        }

        /**
         * Get user's complete profile with bookings
         * Aggregates: user dashboard, booking history
         */
        @GetMapping("/profile/complete")
        @Operation(summary = "Get complete user profile", description = "Returns user profile with all related data")
        public CompletableFuture<ResponseEntity<Response<CompleteUserProfile>>> getCompleteUserProfile(
                        @RequestHeader("Username") String username,
                        @RequestHeader("User-Id") Integer userId) {

                log.info("BFF: Fetching complete profile for user: {}", username);

                CompletableFuture<AggregatedUserDashboard> dashboardFuture = authAggregator.getUserDashboard(username,
                                userId);

                CompletableFuture<BookingHistoryResponse> bookingHistoryFuture = bookingAggregator
                                .getBookingHistory(userId, 0, 10);

                return CompletableFuture.allOf(dashboardFuture, bookingHistoryFuture)
                                .thenApply(v -> {
                                        CompleteUserProfile profile = CompleteUserProfile.builder()
                                                        .dashboard(dashboardFuture.join())
                                                        .recentBookings(bookingHistoryFuture.join())
                                                        .build();

                                        return ResponseEntity.ok(
                                                        new Response<>(200, "Profile retrieved", profile));
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching complete profile", ex);
                                        return ResponseEntity.status(500).body(
                                                        new Response<>(500, "Profile fetch failed", null));
                                });
        }

        /**
         * Health check endpoint for BFF layer
         */
        @GetMapping("/health")
        @Operation(summary = "BFF Health Check", description = "Check health of Web-BFF and downstream services")
        public ResponseEntity<Response<HealthStatus>> healthCheck() {
                log.debug("BFF: Health check requested");

                HealthStatus health = HealthStatus.builder()
                                .status("UP")
                                .service("Web-BFF")
                                .version("2.0.0")
                                .timestamp(java.time.LocalDateTime.now().toString())
                                .aggregatorsActive(4)
                                .build();

                return ResponseEntity.ok(new Response<>(200, "BFF is healthy", health));
        }

        /**
         * Get API info
         */
        @GetMapping("/info")
        @Operation(summary = "Get API info")
        public ResponseEntity<Response<ApiInfo>> getApiInfo() {
                ApiInfo info = ApiInfo.builder()
                                .name("Ticket Katum Web-BFF")
                                .version("2.0.0")
                                .description("Backend for Frontend - Domain-Specific Aggregators")
                                .aggregators(java.util.List.of(
                                                "HotelAggregator",
                                                "AuthAggregator",
                                                "BookingAggregator",
                                                "PaymentAggregator"))
                                .services(9)
                                .endpoints(45)
                                .build();

                return ResponseEntity.ok(new Response<>(200, "API info", info));
        }
}
