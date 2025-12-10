package com.ticketkatum.controller;

import com.ticketkatum.dto.*;
import com.ticketkatum.dto.hotel.HotelManagementDashboard;
import com.ticketkatum.dto.hotel.HotelSearchCriteria;
import com.ticketkatum.dto.hotel.HotelSummaryDTO;
import com.ticketkatum.exception.*;
import com.ticketkatum.service.HotelAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/bff/v1/hotels")
@RequiredArgsConstructor
@Validated
@Tag(name = "Hotel BFF", description = "Hotel aggregated APIs")
@SecurityRequirement(name = "bearer-jwt")
public class HotelBffController {

    private final HotelAggregator hotelAggregator;
    private static final long OPERATION_TIMEOUT_SECONDS = 30;

    @GetMapping("/{hotelId}/complete")
    @Operation(summary = "Get complete hotel details",
            description = "Returns hotel with rooms, staff, maintenance status, and recommendations")
    public CompletableFuture<ResponseEntity<Response<AggregatedHotelDetails>>> getCompleteHotelDetails(
            @Parameter(description = "Hotel ID") @PathVariable @Min(1) Long hotelId,
            @Parameter(description = "User ID for personalization")
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching complete hotel details for hotelId: {}", correlationId, hotelId);

        return hotelAggregator.getCompleteHotelDetails(hotelId, userId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(details -> {
                    log.info("[{}] Hotel details retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<AggregatedHotelDetails>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Hotel details retrieved successfully")
                                    .data(details)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get hotel details");
                });
    }

    @PostMapping("/search")
    @Operation(summary = "Search hotels with recommendations",
            description = "Advanced hotel search with personalized recommendations")
    public CompletableFuture<ResponseEntity<Response<AggregatedSearchResults>>> searchHotelsWithRecommendations(
            @Valid @RequestBody HotelSearchCriteria criteria,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Searching hotels for user: {}", correlationId, userId);

        return hotelAggregator.searchHotelsWithRecommendations(criteria, userId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(results -> {
                    log.info("[{}] Search completed: {} results found",
                            correlationId, results.getTotalResults());
                    return ResponseEntity.ok(
                            Response.<AggregatedSearchResults>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Search completed successfully")
                                    .data(results)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Search hotels");
                });
    }

    @GetMapping("/{hotelId}/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOTEL_MANAGER')")
    @Operation(summary = "Get hotel management dashboard",
            description = "Returns comprehensive dashboard data for hotel management. Requires ADMIN or HOTEL_MANAGER role.")
    public CompletableFuture<ResponseEntity<Response<HotelManagementDashboard>>> getManagementDashboard(
            @PathVariable @Min(1) Long hotelId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching management dashboard for hotelId: {}", correlationId, hotelId);

        return hotelAggregator.getManagementDashboard(hotelId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(dashboard -> {
                    log.info("[{}] Dashboard data retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<HotelManagementDashboard>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Dashboard data retrieved successfully")
                                    .data(dashboard)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get dashboard");
                });
    }

    @GetMapping("/home")
    @Operation(summary = "Get home page hotel data",
            description = "Returns all hotel data needed for home page rendering")
    public CompletableFuture<ResponseEntity<Response<HomePageData>>> getHomePageData(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(required = false) @Min(-90) @Max(90) Double lat,
            @RequestParam(required = false) @Min(-180) @Max(180) Double lon) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching home page hotel data for user: {}", correlationId, userId);


        return hotelAggregator.getHomePageData(userId, lat, lon)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(data -> {
                    log.info("[{}] Home page data retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<HomePageData>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Home page data retrieved successfully")
                                    .data(data)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get home page data");
                });
    }

    @GetMapping("/quick-search")
    @Operation(summary = "Quick hotel search",
            description = "Fast search endpoint with minimal data for mobile clients")
    public CompletableFuture<ResponseEntity<Response<AggregatedSearchResults>>> quickSearch(
            @RequestParam String city,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @Min(1) @Max(5) Integer minStars,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) Integer limit,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Quick search - city: {}, maxPrice: {}", correlationId, city, maxPrice);

        HotelSearchCriteria criteria = HotelSearchCriteria.builder()
                .city(city.trim())
                .maxPrice(maxPrice)
                .minStars(minStars)
                .limit(limit)
                .build();

        return hotelAggregator.searchHotelsWithRecommendations(criteria, userId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(results -> {
                    log.info("[{}] Quick search completed: {} results", correlationId, results.getTotalResults());
                    return ResponseEntity.ok(
                            Response.<AggregatedSearchResults>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Quick search completed successfully")
                                    .data(results)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Quick search");
                });
    }

    @GetMapping("/{hotelId}/summary")
    @Operation(summary = "Get hotel summary",
            description = "Returns lightweight hotel data optimized for listing views")
    public CompletableFuture<ResponseEntity<Response<HotelSummaryDTO>>> getHotelSummary(
            @PathVariable @Min(1) Long hotelId,
            @RequestParam(required = false) @Min(-90) @Max(90) Double userLat,
            @RequestParam(required = false) @Min(-180) @Max(180) Double userLon) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching hotel summary for hotelId: {}", correlationId, hotelId);

        return hotelAggregator.getCompleteHotelDetails(hotelId, null)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
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

                    log.info("[{}] Hotel summary retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<HotelSummaryDTO>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Hotel summary retrieved successfully")
                                    .data(summary)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get hotel summary");
                });
    }

    private RuntimeException handleAsyncException(Throwable ex, String correlationId, String operation) {
        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        log.error("[{}] {} failed: {}", correlationId, operation, cause.getMessage(), cause);

        if (cause instanceof RuntimeException) {
            return (RuntimeException) cause;
        }
        return new BusinessException("OPERATION_FAILED",
                operation + " failed: " + cause.getMessage(), cause);
    }
}
