package com.ticketkatum.controller;

import com.ticketkatum.model.*;
import com.ticketkatum.redis.RedisHotelCacheService;
import com.ticketkatum.service.serviceimpl.HotelRecommendationService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/find")
@RequiredArgsConstructor
@Tag(name = "Hotel Recommendations", description = "Hotel search and recommendation APIs")
public class HotelRecommendationController {

    private final HotelRecommendationService hotelService;
    private final RedisHotelCacheService redisCache;

    @PostMapping("/nearby")
    @Operation(summary = "Find nearby hotels",
            description = "Search for hotels within a specified radius using geospatial coordinates")
    public ResponseEntity<NearbyHotelResponse> findNearbyHotels(
            @RequestBody NearbyHotelRequest request) {
        log.info("Finding nearby hotels: {}", request);
        NearbyHotelResponse response = hotelService.findNearbyHotels(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hotel by ID")
    public ResponseEntity<HotelRecommendation> getHotelById(
            @PathVariable Long id,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {
        log.info("Getting hotel by ID: {}", id);
        HotelRecommendation hotel = hotelService.getHotelById(id, userLat, userLon);
        return ResponseEntity.ok(hotel);
    }

    @GetMapping("/personalized")
    @Operation(summary = "Get personalized recommendations")
    public ResponseEntity<List<HotelRecommendation>> getPersonalizedRecommendations(
            @RequestParam(name = "userId") String userId,
            @RequestParam(name = "latitude") Double latitude,
            @RequestParam(name = "longitude") Double longitude,
            @RequestParam(name = "limit", defaultValue = "10") Integer limit) {
        log.info("Getting personalized recommendations for user: {}", userId);
        List<HotelRecommendation> recommendations =
                hotelService.getPersonalizedRecommendations(userId, latitude, longitude, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured hotels")
    public ResponseEntity<Response<List<HotelRecommendation>>> getFeaturedHotels(
            @RequestParam(name = "limit", defaultValue = "10") Integer limit) {

        log.info("Getting featured hotels");
        List<HotelRecommendation> hotels = hotelService.getFeaturedHotels(limit);

        return ResponseEntity.ok(
                ResponseHandler.success("Featured hotels fetched", hotels)
        );
    }


    @GetMapping("/city/{city}")
    @Operation(summary = "Search hotels by city")
    public ResponseEntity<List<HotelRecommendation>> searchByCity(
            @PathVariable(name = "city") String city,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLon", required = false) Double userLon,
            @RequestParam(name = "limit", defaultValue = "20") Integer limit) {
        log.info("Searching hotels in city: {}", city);
        List<HotelRecommendation> hotels =
                hotelService.searchByCity(city, userLat, userLon, limit);
        return ResponseEntity.ok(hotels);
    }

    @PostMapping("/search")
    @Operation(summary = "Advanced hotel search")
    public ResponseEntity<List<HotelRecommendation>> advancedSearch(
            @RequestBody HotelSearchRequest searchRequest) {
        log.info("Advanced search: {}", searchRequest);
        List<HotelRecommendation> hotels = hotelService.advancedSearch(searchRequest);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Get top-rated hotels")
    public ResponseEntity<Response<List<HotelRecommendation>>> getTopRatedHotels(
            @RequestParam(name = "limit", defaultValue = "10") Integer limit,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLon", required = false) Double userLon) {

        log.info("Getting top-rated hotels");

        List<HotelRecommendation> hotels =
                hotelService.getTopRatedHotels(limit, userLat, userLon);

        return ResponseEntity.ok(
                ResponseHandler.success("Top-rated hotels fetched", hotels)
        );
    }


    @GetMapping("/budget")
    @Operation(summary = "Get budget hotels")
    public ResponseEntity<List<HotelRecommendation>> getBudgetHotels(
            @RequestParam(name = "maxPrice") BigDecimal maxPrice,
            @RequestParam(name = "city", required = false) String city,
            @RequestParam(name = "limit", defaultValue = "20") Integer limit,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLon", required = false) Double userLon) {
        log.info("Getting budget hotels with max price: {}", maxPrice);
        List<HotelRecommendation> hotels =
                hotelService.getBudgetHotels(maxPrice, city, limit, userLat, userLon);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/star-rating/{stars}")
    @Operation(summary = "Get hotels by star rating")
    public ResponseEntity<List<HotelRecommendation>> getHotelsByStarRating(
            @PathVariable(name = "stars") Integer stars,
            @RequestParam(name = "city", required = false) String city,
            @RequestParam(name = "limit", defaultValue = "20") Integer limit,
            @RequestParam(name = "userLat", required = false) Double userLat,
            @RequestParam(name = "userLon", required = false) Double userLon) {
        log.info("Getting {}-star hotels", stars);
        List<HotelRecommendation> hotels =
                hotelService.getHotelsByStarRating(stars, city, limit, userLat, userLon);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/cities")
    @Operation(summary = "Get available cities")
    public ResponseEntity<Response<List<String>>> getAvailableCities() {

        log.info("Getting available cities");

        List<String> cities = hotelService.getAvailableCities();

        return ResponseEntity.ok(
                ResponseHandler.success("Available cities fetched", cities)
        );
    }


    @PostMapping("/{id}/availability")
    @Operation(summary = "Check hotel availability")
    public ResponseEntity<HotelAvailabilityResponse> checkAvailability(
            @PathVariable("id") Long id,
            @RequestBody HotelAvailabilityRequest request) {
        log.info("Checking availability for hotel: {}", id);
        HotelAvailabilityResponse response =
                hotelService.checkAvailability(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filters")
    @Operation(summary = "Get filter options")
    public ResponseEntity<HotelFilterOptions> getFilterOptions() {
        log.info("Getting filter options");
        HotelFilterOptions options = hotelService.getFilterOptions();
        return ResponseEntity.ok(options);
    }

    // ============ Cache Management Endpoints ============

    @PostMapping("/cache/clear")
    @Operation(summary = "Clear all hotel caches")
    public ResponseEntity<String> clearAllCaches() {
        log.info("Clearing all hotel caches");
        redisCache.clearAllCaches();
        return ResponseEntity.ok("All caches cleared successfully");
    }

    @PostMapping("/cache/invalidate/{hotelId}")
    @Operation(summary = "Invalidate cache for specific hotel")
    public ResponseEntity<String> invalidateHotelCache(@PathVariable Long hotelId) {
        log.info("Invalidating cache for hotel: {}", hotelId);
        redisCache.invalidateHotelCaches(hotelId);
        return ResponseEntity.ok("Cache invalidated for hotel ID: " + hotelId);
    }

    @PostMapping("/cache/warm-up")
    @Operation(summary = "Warm up cache with all hotels")
    public ResponseEntity<String> warmUpCache() {
        log.info("Warming up cache");
        // This will be triggered automatically on startup
        return ResponseEntity.ok("Cache warm-up initiated");
    }

    @GetMapping("/cache/check/{hotelId}")
    @Operation(summary = "Check if hotel is in cache")
    public ResponseEntity<Boolean> checkCacheStatus(@PathVariable Long hotelId) {
        boolean inCache = redisCache.isHotelInGeoIndex(hotelId);
        return ResponseEntity.ok(inCache);
    }

    /**
     * Get personalized recommendations
     * GET /api/hotels/recommendations?lat=27.7172&lon=85.3240&limit=10
     */
    @GetMapping("/recommendations")
    public ResponseEntity<Response<?>> getPersonalizedRecommendations(
            @RequestParam(name = "lat", required = false, defaultValue = "27.7172") Double lat,
            @RequestParam(name = "lon", required = false, defaultValue = "85.3240") Double lon,
            @RequestParam(name = "limit", defaultValue = "10") @Min(1) @Max(20) Integer limit,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("Getting personalized recommendations for user: {}", userId);

        try {
            List<HotelRecommendation> recommendations = hotelService
                    .getPersonalizedRecommendations(userId, lat, lon, limit);

            if (recommendations.isEmpty()) {
                Response<?> response = ResponseHandler.successWildcard(
                        "No recommendations found for your location",
                        recommendations
                );
                return ResponseEntity.ok(response);
            }

            Response<?> response = ResponseHandler.successWildcard(
                    String.format("Found %d personalized recommendations", recommendations.size()),
                    recommendations
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting personalized recommendations", e);
            Response<?> response = ResponseHandler.failureWildcard(
                    "Failed to get recommendations: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}