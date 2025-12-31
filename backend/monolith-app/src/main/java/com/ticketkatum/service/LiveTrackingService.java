package com.ticketkatum.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service to handle live tracking of buses.
 * Simulates GPS movement for demo purposes with realistic behavior.
 */
@Slf4j
@Service
public class LiveTrackingService {

    private final ConcurrentHashMap<String, BusLocation> busLocations = new ConcurrentHashMap<>();
    private final Random random = new Random();

    // Kathmandu Coordinates for simulation center
    private static final double CENTER_LAT = 27.7172;
    private static final double CENTER_LNG = 85.3240;

    // Simulation bounds (approximate Kathmandu valley)
    private static final double MAX_LAT_OFFSET = 0.05; // ~5.5 km
    private static final double MAX_LNG_OFFSET = 0.05;

    // Movement parameters
    private static final double MAX_MOVEMENT_PER_UPDATE = 0.0005; // ~55 meters
    private static final int MIN_SPEED = 0;
    private static final int MAX_SPEED = 80;
    private static final int SPEED_VARIANCE = 5;

    public LiveTrackingService() {
        log.info("Initializing LiveTrackingService with simulated bus data");
        initializeDummyBuses();
    }

    /**
     * Initialize dummy buses for demonstration
     */
    private void initializeDummyBuses() {
        // Central Kathmandu buses
        busLocations.put("bus-101", BusLocation.builder()
                .id("bus-101")
                .busNumber("BA 1 KHA 1010")
                .routeName("Kathmandu-Bhaktapur")
                .lat(CENTER_LAT)
                .lng(CENTER_LNG)
                .speedKmph(30)
                .heading(45.0)
                .status("IN_TRANSIT")
                .lastUpdated(LocalDateTime.now())
                .build());

        busLocations.put("bus-102", BusLocation.builder()
                .id("bus-102")
                .busNumber("BA 2 KHA 2020")
                .routeName("Pokhara-Kathmandu")
                .lat(CENTER_LAT + 0.01)
                .lng(CENTER_LNG + 0.01)
                .speedKmph(45)
                .heading(90.0)
                .status("IN_TRANSIT")
                .lastUpdated(LocalDateTime.now())
                .build());

        busLocations.put("bus-103", BusLocation.builder()
                .id("bus-103")
                .busNumber("BA 3 KHA 3030")
                .routeName("Kathmandu-Chitwan")
                .lat(CENTER_LAT - 0.01)
                .lng(CENTER_LNG - 0.005)
                .speedKmph(20)
                .heading(180.0)
                .status("IN_TRANSIT")
                .lastUpdated(LocalDateTime.now())
                .build());

        busLocations.put("bus-104", BusLocation.builder()
                .id("bus-104")
                .busNumber("BA 1 KHA 4040")
                .routeName("Kathmandu-Patan")
                .lat(CENTER_LAT + 0.005)
                .lng(CENTER_LNG - 0.01)
                .speedKmph(0)
                .heading(270.0)
                .status("STOPPED")
                .lastUpdated(LocalDateTime.now())
                .build());

        busLocations.put("bus-105", BusLocation.builder()
                .id("bus-105")
                .busNumber("BA 2 KHA 5050")
                .routeName("Kathmandu-Banepa")
                .lat(CENTER_LAT - 0.005)
                .lng(CENTER_LNG + 0.015)
                .speedKmph(55)
                .heading(135.0)
                .status("IN_TRANSIT")
                .lastUpdated(LocalDateTime.now())
                .build());

        log.info("Initialized {} buses for live tracking", busLocations.size());
    }

    /**
     * Stream live bus locations via Server-Sent Events (SSE)
     * Updates every 5 seconds with simulated movement
     */
    public Flux<LiveTrackingPayload> getBusLocationStream() {
        log.info("Starting bus location stream");

        return Flux.interval(Duration.ofSeconds(5))
                .doOnNext(seq -> log.debug("Emitting location update sequence: {}", seq))
                .map(sequence -> {
                    updateLocations();
                    return getSnapshot();
                })
                .doOnCancel(() -> log.info("Bus location stream cancelled"))
                .doOnError(error -> log.error("Error in bus location stream", error));
    }

    /**
     * Get current snapshot of all bus locations
     */
    public LiveTrackingPayload getSnapshot() {
        List<BusLocation> activeBuses = busLocations.values().stream()
                .filter(bus -> !"OFFLINE".equals(bus.getStatus()))
                .collect(Collectors.toList());

        return LiveTrackingPayload.builder()
                .activeBuses(activeBuses.size())
                .totalBuses(busLocations.size())
                .buses(activeBuses)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Add a new bus to tracking system
     */
    public void addBus(String busId, String busNumber, String routeName, double lat, double lng) {
        BusLocation location = BusLocation.builder()
                .id(busId)
                .busNumber(busNumber)
                .routeName(routeName)
                .lat(lat)
                .lng(lng)
                .speedKmph(0)
                .heading(0.0)
                .status("STOPPED")
                .lastUpdated(LocalDateTime.now())
                .build();

        busLocations.put(busId, location);
        log.info("Added bus {} to tracking system", busId);
    }

    /**
     * Remove bus from tracking system
     */
    public void removeBus(String busId) {
        BusLocation removed = busLocations.remove(busId);
        if (removed != null) {
            log.info("Removed bus {} from tracking system", busId);
        }
    }

    /**
     * Update specific bus location (for real GPS integration)
     */
    public void updateBusLocation(String busId, double lat, double lng, int speedKmph, double heading) {
        BusLocation location = busLocations.get(busId);
        if (location != null) {
            location.setLat(lat);
            location.setLng(lng);
            location.setSpeedKmph(speedKmph);
            location.setHeading(heading);
            location.setStatus(speedKmph > 0 ? "IN_TRANSIT" : "STOPPED");
            location.setLastUpdated(LocalDateTime.now());
            log.debug("Updated location for bus {}", busId);
        }
    }

    /**
     * Get specific bus location
     */
    public BusLocation getBusLocation(String busId) {
        return busLocations.get(busId);
    }

    /**
     * Get all buses for a specific route
     */
    public List<BusLocation> getBusesByRoute(String routeName) {
        return busLocations.values().stream()
                .filter(bus -> bus.getRouteName() != null &&
                        bus.getRouteName().equalsIgnoreCase(routeName))
                .collect(Collectors.toList());
    }

    /**
     * Simulate location updates for all buses
     */
    private void updateLocations() {
        busLocations.forEach((id, loc) -> {
            // Skip offline buses
            if ("OFFLINE".equals(loc.getStatus())) {
                return;
            }

            // Occasionally stop buses (10% chance)
            if (random.nextInt(100) < 10 && loc.getSpeedKmph() > 0) {
                loc.setSpeedKmph(0);
                loc.setStatus("STOPPED");
                loc.setLastUpdated(LocalDateTime.now());
                return;
            }

            // Restart stopped buses (20% chance)
            if (random.nextInt(100) < 20 && loc.getSpeedKmph() == 0) {
                loc.setSpeedKmph(20 + random.nextInt(30));
                loc.setStatus("IN_TRANSIT");
            }

            // Only move buses that are in transit
            if (!"IN_TRANSIT".equals(loc.getStatus())) {
                return;
            }

            // Calculate movement based on heading and speed
            double speedFactor = loc.getSpeedKmph() / 100.0;
            double movementDistance = MAX_MOVEMENT_PER_UPDATE * speedFactor;

            // Update position based on heading
            double headingRadians = Math.toRadians(loc.getHeading());
            double latChange = movementDistance * Math.cos(headingRadians);
            double lngChange = movementDistance * Math.sin(headingRadians);

            // Add some randomness to simulate realistic movement
            latChange += (random.nextDouble() - 0.5) * 0.0001;
            lngChange += (random.nextDouble() - 0.5) * 0.0001;

            double newLat = loc.getLat() + latChange;
            double newLng = loc.getLng() + lngChange;

            // Keep within bounds, reverse direction if hitting boundary
            if (Math.abs(newLat - CENTER_LAT) > MAX_LAT_OFFSET) {
                loc.setHeading((loc.getHeading() + 180) % 360);
                newLat = loc.getLat() - latChange;
            }
            if (Math.abs(newLng - CENTER_LNG) > MAX_LNG_OFFSET) {
                loc.setHeading((loc.getHeading() + 180) % 360);
                newLng = loc.getLng() - lngChange;
            }

            // Update location
            loc.setLat(newLat);
            loc.setLng(newLng);

            // Occasionally change heading slightly (30% chance)
            if (random.nextInt(100) < 30) {
                double headingChange = (random.nextDouble() - 0.5) * 20;
                loc.setHeading((loc.getHeading() + headingChange + 360) % 360);
            }

            // Update speed with variance
            int speedChange = random.nextInt(SPEED_VARIANCE * 2 + 1) - SPEED_VARIANCE;
            int newSpeed = loc.getSpeedKmph() + speedChange;
            loc.setSpeedKmph(Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed)));

            loc.setLastUpdated(LocalDateTime.now());
        });
    }

    /**
     * Get tracking statistics
     */
    public TrackingStatistics getStatistics() {
        long inTransit = busLocations.values().stream()
                .filter(bus -> "IN_TRANSIT".equals(bus.getStatus()))
                .count();

        long stopped = busLocations.values().stream()
                .filter(bus -> "STOPPED".equals(bus.getStatus()))
                .count();

        long offline = busLocations.values().stream()
                .filter(bus -> "OFFLINE".equals(bus.getStatus()))
                .count();

        double avgSpeed = busLocations.values().stream()
                .filter(bus -> "IN_TRANSIT".equals(bus.getStatus()))
                .mapToInt(BusLocation::getSpeedKmph)
                .average()
                .orElse(0.0);

        return TrackingStatistics.builder()
                .totalBuses(busLocations.size())
                .inTransit((int) inTransit)
                .stopped((int) stopped)
                .offline((int) offline)
                .averageSpeed(avgSpeed)
                .build();
    }

    // ==================== DTOs ====================

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LiveTrackingPayload {
        private int activeBuses;
        private int totalBuses;
        private List<BusLocation> buses;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BusLocation {
        private String id;
        private String busNumber;
        private String routeName;
        private double lat;
        private double lng;
        private int speedKmph;
        private double heading; // Direction in degrees (0-360)
        private String status; // IN_TRANSIT, STOPPED, OFFLINE
        private LocalDateTime lastUpdated;
        private String driverName;
        private Integer passengerCount;
        private String nextStop;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrackingStatistics {
        private int totalBuses;
        private int inTransit;
        private int stopped;
        private int offline;
        private double averageSpeed;
    }
}