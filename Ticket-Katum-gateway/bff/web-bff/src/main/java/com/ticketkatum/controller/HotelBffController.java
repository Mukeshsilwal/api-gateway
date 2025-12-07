package com.ticketkatum.controller;


import com.ticketkatum.dto.AggregatedHotelDetails;
import com.ticketkatum.dto.AggregatedSearchResults;
import com.ticketkatum.dto.HomePageData;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.HotelManagementDashboard;
import com.ticketkatum.dto.hotel.HotelSearchCriteria;
import com.ticketkatum.dto.hotel.HotelSummaryDTO;
import com.ticketkatum.service.HotelAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * Hotel BFF Controller
 * Handles hotel-related aggregated endpoints
 * Uses HotelAggregator for domain-specific logic
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotel BFF", description = "Hotel aggregated APIs")
public class HotelBffController {

    private final HotelAggregator hotelAggregator;

    /**
     * Get complete hotel details with all related information
     * Aggregates: hotel, rooms, staff, maintenance, recommendations
     */
    @GetMapping("/{hotelId}/complete")
    @Operation(summary = "Get complete hotel details",
            description = "Returns hotel with rooms, staff, maintenance status, and recommendations")
    public CompletableFuture<ResponseEntity<Response<AggregatedHotelDetails>>> getCompleteHotelDetails(
            @Parameter(description = "Hotel ID")
            @PathVariable Long hotelId,
            @Parameter(description = "User ID for personalization")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("BFF: Fetching complete hotel details for hotelId: {}", hotelId);

        return hotelAggregator.getCompleteHotelDetails(hotelId, userId)
                .thenApply(details -> ResponseEntity.ok(
                        new Response<>(200, "Hotel details retrieved successfully", details)))
                .exceptionally(ex -> {
                    log.error("Error fetching complete hotel details", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch hotel details: " + ex.getMessage(), null));
                });
    }

    /**
     * Search hotels with personalized recommendations
     * Aggregates: search results, personalized recommendations, nearby hotels
     */
    @PostMapping("/search")
    @Operation(summary = "Search hotels with recommendations",
            description = "Advanced hotel search with personalized recommendations")
    public CompletableFuture<ResponseEntity<Response<AggregatedSearchResults>>> searchHotelsWithRecommendations(
            @Valid @RequestBody HotelSearchCriteria criteria,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("BFF: Searching hotels with recommendations for user: {}", userId);

        return hotelAggregator.searchHotelsWithRecommendations(criteria, userId)
                .thenApply(results -> ResponseEntity.ok(
                        new Response<>(200, "Search completed successfully", results)))
                .exceptionally(ex -> {
                    log.error("Error in hotel search", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Search failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Get hotel management dashboard
     * Aggregates: hotel info, rooms, staff, maintenance, revenue metrics
     */
    @GetMapping("/{hotelId}/dashboard")
    @Operation(summary = "Get hotel management dashboard",
            description = "Returns comprehensive dashboard data for hotel management")
    public CompletableFuture<ResponseEntity<Response<HotelManagementDashboard>>> getManagementDashboard(
            @PathVariable Long hotelId) {

        log.info("BFF: Fetching management dashboard for hotelId: {}", hotelId);

        return hotelAggregator.getManagementDashboard(hotelId)
                .thenApply(dashboard -> ResponseEntity.ok(
                        new Response<>(200, "Dashboard data retrieved successfully", dashboard)))
                .exceptionally(ex -> {
                    log.error("Error fetching dashboard", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Dashboard fetch failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Get home page data
     * Aggregates: featured hotels, recommendations, nearby, cities
     */
    @GetMapping("/home")
    @Operation(summary = "Get home page hotel data",
            description = "Returns all hotel data needed for home page rendering")
    public CompletableFuture<ResponseEntity<Response<HomePageData>>> getHomePageData(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {

        log.info("BFF: Fetching home page hotel data for user: {}", userId);

        return hotelAggregator.getHomePageData(userId, lat, lon)
                .thenApply(data -> ResponseEntity.ok(
                        new Response<>(200, "Home page data retrieved successfully", data)))
                .exceptionally(ex -> {
                    log.error("Error fetching home page data", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Home page fetch failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Quick search endpoint optimized for mobile
     * Returns minimal data for fast loading
     */
    @GetMapping("/quick-search")
    @Operation(summary = "Quick hotel search",
            description = "Fast search endpoint with minimal data for mobile clients")
    public CompletableFuture<ResponseEntity<Response<AggregatedSearchResults>>> quickSearch(
            @RequestParam String city,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minStars,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("BFF: Quick search - city: {}, maxPrice: {}", city, maxPrice);

        HotelSearchCriteria criteria = HotelSearchCriteria.builder()
                .city(city)
                .maxPrice(maxPrice)
                .minStars(minStars)
                .limit(limit)
                .build();

        return hotelAggregator.searchHotelsWithRecommendations(criteria, userId)
                .thenApply(results -> ResponseEntity.ok(
                        new Response<>(200, "Quick search completed", results)))
                .exceptionally(ex -> {
                    log.error("Error in quick search", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Quick search failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Get hotel summary for listing pages
     * Returns lightweight hotel data for list views
     */
    @GetMapping("/{hotelId}/summary")
    @Operation(summary = "Get hotel summary",
            description = "Returns lightweight hotel data optimized for listing views")
    public CompletableFuture<ResponseEntity<Response<HotelSummaryDTO>>> getHotelSummary(
            @PathVariable Long hotelId,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {

        log.info("BFF: Fetching hotel summary for hotelId: {}", hotelId);

        return hotelAggregator.getCompleteHotelDetails(hotelId, null)
                .thenApply(details -> {
                    HotelSummaryDTO summary = HotelSummaryDTO.builder()
                            .id(details.getHotel().getId())
                            .name(details.getHotel().getName())
                            .city(details.getHotel().getCity())
                            .stars(details.getHotel().getStars())
                            .averageRating(details.getAverageRating())
                            .reviewCount(details.getReviewCount())
                            .priceRange(details.getPriceRange())
                            .availableRooms(details.getAvailableRooms())
                            .thumbnailImage(details.getHotel().getImageUrl())
                            .build();

                    return ResponseEntity.ok(
                            new Response<>(200, "Hotel summary retrieved", summary));
                })
                .exceptionally(ex -> {
                    log.error("Error fetching hotel summary", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Summary fetch failed: " + ex.getMessage(), null));
                });
    }
}