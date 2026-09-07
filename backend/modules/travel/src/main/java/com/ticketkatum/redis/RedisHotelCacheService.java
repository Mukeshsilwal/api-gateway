package com.ticketkatum.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.entity.Hotel;
import com.ticketkatum.model.HotelRecommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisHotelCacheService {

    private static final String HOTELS_GEO_KEY = "hotels:locations";
    private static final String HOTEL_DETAIL_PREFIX = "hotel:detail:";
    private static final String NEARBY_SEARCH_PREFIX = "nearby:hotels:";
    private static final String HOTEL_RECOMMENDATION_PREFIX = "hotel:recommendation:";

    private static final int HOTEL_DETAIL_TTL_HOURS = 24;
    private static final int SEARCH_RESULT_TTL_MINUTES = 30;
    private static final int RECOMMENDATION_TTL_MINUTES = 60;

    @Qualifier("customRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${cache.redis.enabled:false}")
    private boolean redisEnabled;

    /**
     * Add hotel to Redis geospatial index
     */
    public void addHotelToGeoIndex(Hotel hotel) {
        if (!redisEnabled || hotel == null) return;
        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();
            Point location = new Point(hotel.getLongitude(), hotel.getLatitude());

            geoOps.add(HOTELS_GEO_KEY, location, hotel.getId().toString());
            log.debug("Added hotel {} to geospatial index at ({}, {})",
                    hotel.getId(), hotel.getLatitude(), hotel.getLongitude());
        } catch (Exception e) {
            log.error("Failed to add hotel {} to geo index", hotel.getId(), e);
        }
    }

    /**
     * Batch add multiple hotels to geospatial index
     */
    public void addHotelsToGeoIndex(List<Hotel> hotels) {
        if (!redisEnabled || hotels == null || hotels.isEmpty()) {
            return;
        }

        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();
            int addedCount = 0;

            for (Hotel hotel : hotels) {
                if (hotel.getLatitude() != null && hotel.getLongitude() != null) {
                    Point point = new Point(hotel.getLongitude(), hotel.getLatitude());
                    geoOps.add(HOTELS_GEO_KEY, point, String.valueOf(hotel.getId()));
                    addedCount++;
                }
            }

            if (addedCount == 0) {
                log.info("No hotels with valid coordinates to add to geo index");
                return;
            }

            log.info("Added {} hotels to geo index", addedCount);
        } catch (Exception e) {
            log.error("Failed to batch add hotels to geo index", e);
        }
    }

    /**
     * Cache hotel details
     */
    public void cacheHotelDetails(Hotel hotel) {
        if (!redisEnabled || hotel == null) return;
        try {
            String key = HOTEL_DETAIL_PREFIX + hotel.getId();
            redisTemplate.opsForValue().set(key, hotel, HOTEL_DETAIL_TTL_HOURS, TimeUnit.HOURS);
            log.debug("Cached hotel details for ID: {}", hotel.getId());
        } catch (Exception e) {
            log.error("Failed to cache hotel details for ID: {}", hotel.getId(), e);
        }
    }

    /**
     * Get cached hotel details
     */
    public Optional<Hotel> getCachedHotelDetails(Long hotelId) {
        if (!redisEnabled || hotelId == null) return Optional.empty();
        try {
            String key = HOTEL_DETAIL_PREFIX + hotelId;
            Hotel hotel = (Hotel) redisTemplate.opsForValue().get(key);
            return Optional.ofNullable(hotel);
        } catch (Exception e) {
            log.error("Failed to get cached hotel details for ID: {}", hotelId, e);
            return Optional.empty();
        }
    }

    /**
     * Get nearby hotel IDs using Redis geospatial query
     */
    public List<String> getNearbyHotelIds(double latitude, double longitude, double radiusKm) {
        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();
            Point center = new Point(longitude, latitude);
            Distance radius = new Distance(radiusKm, Metrics.KILOMETERS);
            Circle searchArea = new Circle(center, radius);

            GeoResults<RedisGeoCommands.GeoLocation<Object>> results = geoOps.radius(
                    HOTELS_GEO_KEY,
                    searchArea,
                    RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                            .includeDistance()
                            .sortAscending()
                            .limit(100));

            if (results == null) {
                return Collections.emptyList();
            }

            return results.getContent().stream()
                    .map(result -> result.getContent().getName().toString())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to get nearby hotel IDs", e);
            return Collections.emptyList();
        }
    }

    /**
     * Get nearby hotels with distance information
     */
    public Map<String, Double> getNearbyHotelsWithDistance(
            double latitude, double longitude, double radiusKm, int limit) {
        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();
            Point center = new Point(longitude, latitude);
            Distance radius = new Distance(radiusKm, Metrics.KILOMETERS);
            Circle searchArea = new Circle(center, radius);

            GeoResults<RedisGeoCommands.GeoLocation<Object>> results = geoOps.radius(
                    HOTELS_GEO_KEY,
                    searchArea,
                    RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                            .includeDistance()
                            .sortAscending()
                            .limit(limit));

            if (results == null) {
                return Collections.emptyMap();
            }

            return results.getContent().stream()
                    .collect(Collectors.toMap(
                            result -> result.getContent().getName().toString(),
                            result -> result.getDistance().getValue()));

        } catch (Exception e) {
            log.error("Failed to get nearby hotels with distance", e);
            return Collections.emptyMap();
        }
    }

    /**
     * Cache search results (complete recommendations)
     */
    public void cacheSearchResults(
            double latitude, double longitude, double radiusKm,
            String sortBy, List<HotelRecommendation> recommendations) {
        try {
            String key = generateSearchCacheKey(latitude, longitude, radiusKm, sortBy);
            redisTemplate.opsForValue().set(
                    key,
                    recommendations,
                    SEARCH_RESULT_TTL_MINUTES,
                    TimeUnit.MINUTES);
            log.debug("Cached search results for location ({}, {})", latitude, longitude);
        } catch (Exception e) {
            log.error("Failed to cache search results", e);
        }
    }

    /**
     * Get cached search results
     */
    @SuppressWarnings("unchecked")
    public Optional<List<HotelRecommendation>> getCachedSearchResults(
            double latitude, double longitude, double radiusKm, String sortBy) {
        try {
            String key = generateSearchCacheKey(latitude, longitude, radiusKm, sortBy);
            List<HotelRecommendation> results = (List<HotelRecommendation>) redisTemplate.opsForValue().get(key);

            if (results != null) {
                log.debug("Cache hit for search results at ({}, {})", latitude, longitude);
            }
            return Optional.ofNullable(results);
        } catch (Exception e) {
            log.error("Failed to get cached search results", e);
            return Optional.empty();
        }
    }

    /**
     * Cache hotel recommendation
     */
    public void cacheRecommendation(Long hotelId, HotelRecommendation recommendation) {
        try {
            String key = HOTEL_RECOMMENDATION_PREFIX + hotelId;
            redisTemplate.opsForValue().set(
                    key,
                    recommendation,
                    RECOMMENDATION_TTL_MINUTES,
                    TimeUnit.MINUTES);
            log.debug("Cached recommendation for hotel ID: {}", hotelId);
        } catch (Exception e) {
            log.error("Failed to cache recommendation for hotel ID: {}", hotelId, e);
        }
    }

    /**
     * Get cached recommendation
     */
    public Optional<HotelRecommendation> getCachedRecommendation(Long hotelId) {
        try {
            String key = HOTEL_RECOMMENDATION_PREFIX + hotelId;
            HotelRecommendation rec = (HotelRecommendation) redisTemplate.opsForValue().get(key);
            return Optional.ofNullable(rec);
        } catch (Exception e) {
            log.error("Failed to get cached recommendation for hotel ID: {}", hotelId, e);
            return Optional.empty();
        }
    }

    /**
     * Update hotel location in geo index
     */
    public void updateHotelLocation(Hotel hotel) {
        try {
            // Remove old location
            redisTemplate.opsForGeo().remove(HOTELS_GEO_KEY, hotel.getId().toString());

            // Add new location
            addHotelToGeoIndex(hotel);

            // Invalidate related caches
            invalidateHotelCaches(hotel.getId());

            log.info("Updated location for hotel ID: {}", hotel.getId());
        } catch (Exception e) {
            log.error("Failed to update hotel location", e);
        }
    }

    /**
     * Remove hotel from geo index
     */
    public void removeHotelFromGeoIndex(Long hotelId) {
        try {
            redisTemplate.opsForGeo().remove(HOTELS_GEO_KEY, hotelId.toString());
            invalidateHotelCaches(hotelId);
            log.info("Removed hotel {} from geo index", hotelId);
        } catch (Exception e) {
            log.error("Failed to remove hotel {} from geo index", hotelId, e);
        }
    }

    /**
     * Invalidate all caches related to a hotel
     */
    public void invalidateHotelCaches(Long hotelId) {
        try {
            String detailKey = HOTEL_DETAIL_PREFIX + hotelId;
            String recommendationKey = HOTEL_RECOMMENDATION_PREFIX + hotelId;

            redisTemplate.delete(detailKey);
            redisTemplate.delete(recommendationKey);

            log.debug("Invalidated caches for hotel ID: {}", hotelId);
        } catch (Exception e) {
            log.error("Failed to invalidate caches for hotel ID: {}", hotelId, e);
        }
    }

    /**
     * Invalidate all search result caches
     */
    public void invalidateAllSearchCaches() {
        try {
            Set<String> keys = redisTemplate.keys(NEARBY_SEARCH_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Invalidated {} search result caches", keys.size());
            }
        } catch (Exception e) {
            log.error("Failed to invalidate search caches", e);
        }
    }

    /**
     * Check if hotel exists in geo index
     */
    public boolean isHotelInGeoIndex(Long hotelId) {
        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();
            List<Point> positions = geoOps.position(HOTELS_GEO_KEY, hotelId.toString());
            return positions != null && !positions.isEmpty() && positions.get(0) != null;
        } catch (Exception e) {
            log.error("Failed to check if hotel {} exists in geo index", hotelId, e);
            return false;
        }
    }

    /**
     * Get distance between hotel and location
     */
    public Optional<Double> getDistanceBetween(Long hotelId, double latitude, double longitude) {
        try {
            GeoOperations<String, Object> geoOps = redisTemplate.opsForGeo();

            // Get hotel position
            List<Point> positions = geoOps.position(HOTELS_GEO_KEY, hotelId.toString());
            if (positions == null || positions.isEmpty() || positions.get(0) == null) {
                return Optional.empty();
            }

            // Calculate distance
            Point hotelLocation = positions.get(0);
            Point userLocation = new Point(longitude, latitude);

            Distance distance = geoOps.distance(
                    HOTELS_GEO_KEY,
                    hotelId.toString(),
                    userLocation,
                    Metrics.KILOMETERS);

            return Optional.ofNullable(distance != null ? distance.getValue() : null);
        } catch (Exception e) {
            log.error("Failed to get distance for hotel {}", hotelId, e);
            return Optional.empty();
        }
    }

    /**
     * Generate cache key for search results
     */
    private String generateSearchCacheKey(
            double lat, double lon, double radius, String sortBy) {
        // Round coordinates to 2 decimal places (~1km precision)
        double roundedLat = Math.round(lat * 100.0) / 100.0;
        double roundedLon = Math.round(lon * 100.0) / 100.0;
        return String.format("%s%.2f:%.2f:%.1f:%s",
                NEARBY_SEARCH_PREFIX, roundedLat, roundedLon, radius, sortBy);
    }

    /**
     * Warm up cache with popular locations or all hotels
     */
    public void warmUpCache(List<Hotel> hotels) {
        if (!redisEnabled) {
            log.info("Redis cache disabled (cache.redis.enabled=false). Skipping hotel cache warm-up.");
            return;
        }
        log.info("Warming up Redis cache with {} hotels", hotels.size());

        try {
            // Add all hotels to geo index in batch
            addHotelsToGeoIndex(hotels);

            // Cache individual hotel details
            for (Hotel hotel : hotels) {
                cacheHotelDetails(hotel);
            }

            log.info("Cache warm-up completed successfully");
        } catch (Exception e) {
            log.error("Failed to warm up cache", e);
        }
    }

    /**
     * Clear all hotel-related caches
     */
    public void clearAllCaches() {
        try {
            Set<String> keys = new HashSet<>();
            keys.addAll(redisTemplate.keys(HOTEL_DETAIL_PREFIX + "*"));
            keys.addAll(redisTemplate.keys(NEARBY_SEARCH_PREFIX + "*"));
            keys.addAll(redisTemplate.keys(HOTEL_RECOMMENDATION_PREFIX + "*"));

            if (!keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cleared {} cache entries", keys.size());
            }

            // Clear geo index
            redisTemplate.delete(HOTELS_GEO_KEY);
            log.info("Cleared geospatial index");

        } catch (Exception e) {
            log.error("Failed to clear all caches", e);
        }
    }
}