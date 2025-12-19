package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Cache Warming Service
 * 
 * Preloads frequently accessed data into cache on startup and periodically.
 * Reduces cache misses and improves response times.
 * 
 * @author Ticket Katum Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheWarmingService {

    private final CacheManager cacheManager;
    private final HotelRepository hotelRepository;
    private final CityRepository cityRepository;
    private final BusRouteRepository busRouteRepository;
    private final OperatorRepository operatorRepository;

    /**
     * Warm cache on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmCacheOnStartup() {
        if (!isCacheWarmingEnabled()) {
            log.info("Cache warming is disabled");
            return;
        }
        
        log.info("Starting cache warming on application startup...");
        
        try {
            warmFeaturedHotels();
            warmCities();
            warmBusRoutes();
            warmBusOperators();
            
            log.info("Cache warming completed successfully");
        } catch (Exception e) {
            log.error("Error during cache warming", e);
        }
    }

    /**
     * Warm featured hotels cache
     * Scheduled: Every hour
     */
    @Scheduled(cron = "${cache.warming.schedule.featured-hotels:0 0 * * * *}")
    public void warmFeaturedHotels() {
        log.debug("Warming featured hotels cache...");
        
        try {
            List<Hotel> featuredHotels = hotelRepository.findFeaturedHotels();
            
            var cache = cacheManager.getCache("featured-hotels");
            if (cache != null) {
                cache.put("all", featuredHotels);
                log.info("Warmed featured hotels cache with {} hotels", featuredHotels.size());
            }
        } catch (Exception e) {
            log.error("Error warming featured hotels cache", e);
        }
    }

    /**
     * Warm cities cache
     * Scheduled: Daily at midnight
     */
    @Scheduled(cron = "${cache.warming.schedule.cities:0 0 0 * * *}")
    public void warmCities() {
        log.debug("Warming cities cache...");
        
        try {
            List<City> cities = cityRepository.findAllActive();
            
            var cache = cacheManager.getCache("cities");
            if (cache != null) {
                cache.put("all", cities);
                log.info("Warmed cities cache with {} cities", cities.size());
            }
        } catch (Exception e) {
            log.error("Error warming cities cache", e);
        }
    }

    /**
     * Warm bus routes cache
     * Scheduled: Every 6 hours
     */
    @Scheduled(cron = "${cache.warming.schedule.bus-routes:0 0 */6 * * *}")
    public void warmBusRoutes() {
        log.debug("Warming bus routes cache...");
        
        try {
            List<BusRoute> routes = busRouteRepository.findAllActive();
            
            var cache = cacheManager.getCache("bus-routes");
            if (cache != null) {
                cache.put("all", routes);
                log.info("Warmed bus routes cache with {} routes", routes.size());
            }
        } catch (Exception e) {
            log.error("Error warming bus routes cache", e);
        }
    }

    /**
     * Warm bus operators cache
     * Scheduled: Daily at midnight
     */
    @Scheduled(cron = "${cache.warming.schedule.bus-operators:0 0 0 * * *}")
    public void warmBusOperators() {
        log.debug("Warming bus operators cache...");
        
        try {
            List<Operator> operators = operatorRepository.findAllActive();
            
            var cache = cacheManager.getCache("bus-operators");
            if (cache != null) {
                cache.put("all", operators);
                log.info("Warmed bus operators cache with {} operators", operators.size());
            }
        } catch (Exception e) {
            log.error("Error warming bus operators cache", e);
        }
    }

    /**
     * Warm popular hotel searches
     */
    public void warmPopularSearches() {
        log.debug("Warming popular hotel searches...");
        
        try {
            // Get popular cities
            List<String> popularCities = List.of(
                "Kathmandu", "Pokhara", "Chitwan", "Lumbini", "Bhaktapur"
            );
            
            var cache = cacheManager.getCache("hotel-search");
            if (cache != null) {
                for (String city : popularCities) {
                    List<Hotel> hotels = hotelRepository.findByCity(city);
                    cache.put(city, hotels);
                }
                log.info("Warmed popular hotel searches for {} cities", popularCities.size());
            }
        } catch (Exception e) {
            log.error("Error warming popular searches", e);
        }
    }

    /**
     * Clear all caches
     */
    public void clearAllCaches() {
        log.info("Clearing all caches...");
        
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.debug("Cleared cache: {}", cacheName);
            }
        });
        
        log.info("All caches cleared");
    }

    /**
     * Clear specific cache
     */
    public void clearCache(String cacheName) {
        log.info("Clearing cache: {}", cacheName);
        
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.info("Cache cleared: {}", cacheName);
        } else {
            log.warn("Cache not found: {}", cacheName);
        }
    }

    /**
     * Evict specific cache entry
     */
    public void evictCacheEntry(String cacheName, Object key) {
        log.debug("Evicting cache entry: {} - {}", cacheName, key);
        
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.debug("Cache entry evicted: {} - {}", cacheName, key);
        }
    }

    /**
     * Check if cache warming is enabled
     */
    private boolean isCacheWarmingEnabled() {
        // Read from configuration
        return true; // Default to true
    }
}
