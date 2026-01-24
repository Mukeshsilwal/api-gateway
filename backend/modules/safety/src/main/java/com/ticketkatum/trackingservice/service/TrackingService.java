package com.ticketkatum.trackingservice.service;

import com.ticketkatum.trackingservice.dto.LocationDTO;
import com.ticketkatum.trackingservice.dto.POIDTO;
import com.ticketkatum.trackingservice.dto.request.LocationUpdateRequest;
import com.ticketkatum.trackingservice.entity.LocationTracking;
import com.ticketkatum.trackingservice.entity.PointOfInterest;
import com.ticketkatum.trackingservice.repository.LocationTrackingRepository;
import com.ticketkatum.trackingservice.repository.PointOfInterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service("safetyTrackingService")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TrackingService {

    private final LocationTrackingRepository locationRepository;
    private final PointOfInterestRepository poiRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String TRACKING_EVENTS_TOPIC = "tracking-events";
    private static final String LOCATION_CACHE_PREFIX = "location:";
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes

    @Transactional
    public LocationDTO updateLocation(LocationUpdateRequest request) {
        log.info("Updating location for {} {}", request.getEntityType(), request.getEntityId());

        LocationTracking location = LocationTracking.builder()
                .tripId(request.getTripId())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .altitude(request.getAltitude())
                .accuracy(request.getAccuracy())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .timestamp(request.getTimestamp())
                .isOffline(request.getIsOffline())
                .batteryLevel(request.getBatteryLevel())
                .build();

        LocationTracking savedLocation = locationRepository.save(location);
        LocationDTO locationDTO = LocationDTO.fromEntity(savedLocation);

        // Cache in Redis for real-time access
        cacheLocation(locationDTO);

        // Broadcast via WebSocket
        broadcastLocation(locationDTO);

        // Publish Kafka event
        publishLocationEvent(locationDTO);

        log.info("Location updated successfully: {}", savedLocation.getTrackingId());
        return locationDTO;
    }

    @Transactional(readOnly = true)
    public LocationDTO getLatestLocation(LocationTracking.EntityType entityType, Long entityId) {
        log.debug("Fetching latest location for {} {}", entityType, entityId);
        
        // Try cache first
        String cacheKey = LOCATION_CACHE_PREFIX + entityType + ":" + entityId;
        LocationDTO cached = (LocationDTO) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Fallback to database
        return locationRepository.findLatestLocationByEntity(entityType, entityId)
                .map(LocationDTO::fromEntity)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<LocationDTO> getLocationHistory(LocationTracking.EntityType entityType, Long entityId, int hours) {
        log.debug("Fetching location history for {} {} (last {} hours)", entityType, entityId, hours);
        
        LocalDateTime startTime = LocalDateTime.now().minusHours(hours);
        List<LocationTracking> locations = locationRepository.findRecentLocationsByEntity(
                entityType, entityId, startTime);
        
        return locations.stream()
                .map(LocationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LocationDTO> getTripLocations(Long tripId) {
        log.debug("Fetching locations for trip: {}", tripId);
        
        List<LocationTracking> locations = locationRepository.findByTripIdOrderByTimestampDesc(tripId);
        return locations.stream()
                .map(LocationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<POIDTO> findNearbyPOIs(double latitude, double longitude, double radiusKm) {
        log.debug("Finding POIs near ({}, {}) within {} km", latitude, longitude, radiusKm);
        
        List<PointOfInterest> pois = poiRepository.findNearbyPOIs(latitude, longitude, radiusKm);
        
        return pois.stream()
                .map(poi -> {
                    POIDTO dto = POIDTO.fromEntity(poi);
                    // Calculate distance
                    double distance = calculateDistance(latitude, longitude, 
                            poi.getLatitudeAsDouble(), poi.getLongitudeAsDouble());
                    dto.setDistanceKm(distance);
                    return dto;
                })
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<POIDTO> findPOIsByCategory(PointOfInterest.POICategory category, String region) {
        log.debug("Finding POIs by category: {} in region: {}", category, region);
        
        List<PointOfInterest> pois = poiRepository.findByCategoryAndRegion(category, region);
        return pois.stream()
                .map(POIDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private void cacheLocation(LocationDTO location) {
        try {
            String cacheKey = LOCATION_CACHE_PREFIX + location.getEntityType() + ":" + location.getEntityId();
            redisTemplate.opsForValue().set(cacheKey, location, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
            log.debug("Cached location: {}", cacheKey);
        } catch (Exception e) {
            log.error("Failed to cache location", e);
        }
    }

    private void broadcastLocation(LocationDTO location) {
        try {
            // Broadcast to trip-specific channel
            if (location.getTripId() != null) {
                String destination = "/topic/tracking/" + location.getTripId();
                messagingTemplate.convertAndSend(destination, location);
                log.debug("Broadcasted location to: {}", destination);
            }
            
            // Broadcast to entity-specific channel
            String entityDestination = "/topic/tracking/" + location.getEntityType() + "/" + location.getEntityId();
            messagingTemplate.convertAndSend(entityDestination, location);
            log.debug("Broadcasted location to: {}", entityDestination);
        } catch (Exception e) {
            log.error("Failed to broadcast location", e);
        }
    }

    private void publishLocationEvent(LocationDTO location) {
        try {
            LocationEvent event = LocationEvent.builder()
                    .eventType("location.updated")
                    .tripId(location.getTripId())
                    .entityType(location.getEntityType())
                    .entityId(location.getEntityId())
                    .latitude(location.getLatitude())
                    .longitude(location.getLongitude())
                    .timestamp(location.getTimestamp())
                    .build();

            kafkaTemplate.send(TRACKING_EVENTS_TOPIC, location.getEntityId().toString(), event);
            log.debug("Published location event for {} {}", location.getEntityType(), location.getEntityId());
        } catch (Exception e) {
            log.error("Failed to publish location event", e);
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LocationEvent {
        private String eventType;
        private Long tripId;
        private String entityType;
        private Long entityId;
        private java.math.BigDecimal latitude;
        private java.math.BigDecimal longitude;
        private LocalDateTime timestamp;
    }
}
