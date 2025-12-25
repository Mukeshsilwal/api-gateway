package com.ticketkatum.journeyservice.service;

import com.ticketkatum.journeyservice.dto.*;
import com.ticketkatum.journeyservice.entity.*;
import com.ticketkatum.journeyservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JourneyService {

    private final JourneyRepository journeyRepository;
    private final JourneySegmentRepository segmentRepository;
    private final JourneySuggestionRepository suggestionRepository;
    private final IntegrationService integrationService;
    private final OptimizationService optimizationService;
    private final SuggestionService suggestionService;

    /**
     * Generate journey from trip data
     */
    @Transactional
    public JourneyDTO generateJourney(Long tripId, Long userId) {
        log.info("Generating journey for trip: {} and user: {}", tripId, userId);

        // Check if journey already exists
        if (journeyRepository.existsByTripId(tripId)) {
            throw new RuntimeException("Journey already exists for trip: " + tripId);
        }

        // Fetch trip data from trip-service
        TripDTO trip = integrationService.getTripData(tripId);
        
        if (!trip.getUserId().equals(userId)) {
            throw new RuntimeException("User not authorized to create journey for this trip");
        }

        // Create journey
        Journey journey = Journey.builder()
                .tripId(tripId)
                .userId(userId)
                .status(Journey.JourneyStatus.DRAFT)
                .build();

        // Fetch existing bookings
        List<BookingDTO> bookings = integrationService.getTripBookings(tripId);
        
        // Generate segments from bookings
        List<JourneySegment> segments = generateSegmentsFromBookings(journey, bookings, trip);
        segments.forEach(journey::addSegment);

        // Calculate journey metrics
        calculateJourneyMetrics(journey);

        // Save journey
        journey = journeyRepository.save(journey);
        log.info("Journey created with ID: {}", journey.getJourneyId());

        // Generate suggestions asynchronously
        suggestionService.generateSuggestionsAsync(journey.getJourneyId());

        // Optimize journey
        optimizationService.optimizeJourneyAsync(journey.getJourneyId());

        return convertToDTO(journey);
    }

    /**
     * Get journey by ID
     */
    @Transactional(readOnly = true)
    public JourneyDTO getJourney(Long journeyId) {
        log.debug("Fetching journey: {}", journeyId);
        
        Journey journey = journeyRepository.findByIdWithDetails(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
        
        return convertToDTO(journey);
    }

    /**
     * Get journey by trip ID
     */
    @Transactional(readOnly = true)
    public JourneyDTO getJourneyByTripId(Long tripId) {
        log.debug("Fetching journey for trip: {}", tripId);
        
        Journey journey = journeyRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException("Journey not found for trip: " + tripId));
        
        return convertToDTO(journey);
    }

    /**
     * Get all journeys for a user
     */
    @Transactional(readOnly = true)
    public List<JourneyDTO> getUserJourneys(Long userId) {
        log.debug("Fetching journeys for user: {}", userId);
        
        List<Journey> journeys = journeyRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return journeys.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active journeys for a user
     */
    @Transactional(readOnly = true)
    public List<JourneyDTO> getActiveJourneys(Long userId) {
        log.debug("Fetching active journeys for user: {}", userId);
        
        List<Journey> journeys = journeyRepository.findActiveJourneysByUserId(userId);
        
        return journeys.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update journey status
     */
    @Transactional
    public JourneyDTO updateJourneyStatus(Long journeyId, Journey.JourneyStatus status) {
        log.info("Updating journey {} status to: {}", journeyId, status);
        
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
        
        journey.setStatus(status);
        journey = journeyRepository.save(journey);
        
        return convertToDTO(journey);
    }

    /**
     * Add segment to journey
     */
    @Transactional
    public SegmentDTO addSegment(Long journeyId, CreateSegmentRequest request) {
        log.info("Adding segment to journey: {}", journeyId);
        
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
        
        // Get next sequence order
        long segmentCount = segmentRepository.countByJourney_JourneyId(journeyId);
        
        JourneySegment segment = JourneySegment.builder()
                .journey(journey)
                .sequenceOrder((int) segmentCount + 1)
                .segmentType(request.getSegmentType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .locationFrom(request.getLocationFrom())
                .locationTo(request.getLocationTo())
                .estimatedCost(request.getEstimatedCost())
                .status(JourneySegment.SegmentStatus.PLANNED)
                .notes(request.getNotes())
                .build();
        
        segment = segmentRepository.save(segment);
        
        // Recalculate journey metrics
        calculateJourneyMetrics(journey);
        journeyRepository.save(journey);
        
        return convertSegmentToDTO(segment);
    }

    /**
     * Update segment
     */
    @Transactional
    public SegmentDTO updateSegment(Long segmentId, UpdateSegmentRequest request) {
        log.info("Updating segment: {}", segmentId);
        
        JourneySegment segment = segmentRepository.findById(segmentId)
                .orElseThrow(() -> new RuntimeException("Segment not found: " + segmentId));
        
        // Update fields
        if (request.getStartTime() != null) segment.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) segment.setEndTime(request.getEndTime());
        if (request.getLocationFrom() != null) segment.setLocationFrom(request.getLocationFrom());
        if (request.getLocationTo() != null) segment.setLocationTo(request.getLocationTo());
        if (request.getEstimatedCost() != null) segment.setEstimatedCost(request.getEstimatedCost());
        if (request.getActualCost() != null) segment.setActualCost(request.getActualCost());
        if (request.getStatus() != null) segment.setStatus(request.getStatus());
        if (request.getNotes() != null) segment.setNotes(request.getNotes());
        
        segment = segmentRepository.save(segment);
        
        // Recalculate journey metrics
        Journey journey = segment.getJourney();
        calculateJourneyMetrics(journey);
        journeyRepository.save(journey);
        
        return convertSegmentToDTO(segment);
    }

    /**
     * Delete segment
     */
    @Transactional
    public void deleteSegment(Long segmentId) {
        log.info("Deleting segment: {}", segmentId);
        
        JourneySegment segment = segmentRepository.findById(segmentId)
                .orElseThrow(() -> new RuntimeException("Segment not found: " + segmentId));
        
        Journey journey = segment.getJourney();
        segmentRepository.delete(segment);
        
        // Recalculate journey metrics
        calculateJourneyMetrics(journey);
        journeyRepository.save(journey);
    }

    /**
     * Delete journey
     */
    @Transactional
    public void deleteJourney(Long journeyId) {
        log.info("Deleting journey: {}", journeyId);
        
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
        
        journeyRepository.delete(journey);
    }

    // ==================== Private Helper Methods ====================

    /**
     * Generate segments from existing bookings
     */
    private List<JourneySegment> generateSegmentsFromBookings(Journey journey, List<BookingDTO> bookings, TripDTO trip) {
        List<JourneySegment> segments = new ArrayList<>();
        int sequenceOrder = 1;

        for (BookingDTO booking : bookings) {
            JourneySegment segment = JourneySegment.builder()
                    .journey(journey)
                    .sequenceOrder(sequenceOrder++)
                    .segmentType(mapBookingTypeToSegmentType(booking.getBookingType()))
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .locationFrom(booking.getLocationFrom())
                    .locationTo(booking.getLocationTo())
                    .bookingReference(booking.getBookingReference())
                    .bookingType(booking.getBookingType())
                    .bookingId(booking.getBookingId())
                    .estimatedCost(booking.getAmount())
                    .actualCost(booking.getAmount())
                    .status(JourneySegment.SegmentStatus.CONFIRMED)
                    .build();
            
            segments.add(segment);
        }

        return segments;
    }

    /**
     * Map booking type to segment type
     */
    private JourneySegment.SegmentType mapBookingTypeToSegmentType(String bookingType) {
        return switch (bookingType.toUpperCase()) {
            case "BUS", "FLIGHT", "TRAIN" -> JourneySegment.SegmentType.TRAVEL;
            case "HOTEL", "RESORT" -> JourneySegment.SegmentType.STAY;
            case "EVENT", "TOUR" -> JourneySegment.SegmentType.ACTIVITY;
            default -> JourneySegment.SegmentType.TRANSIT;
        };
    }

    /**
     * Calculate journey metrics (distance, duration, cost)
     */
    private void calculateJourneyMetrics(Journey journey) {
        List<JourneySegment> segments = journey.getSegments();
        
        if (segments.isEmpty()) {
            journey.setTotalDistanceKm(BigDecimal.ZERO);
            journey.setEstimatedDurationHours(BigDecimal.ZERO);
            journey.setTotalEstimatedCost(BigDecimal.ZERO);
            return;
        }

        // Calculate total duration
        LocalDateTime firstStart = segments.stream()
                .map(JourneySegment::getStartTime)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
        
        LocalDateTime lastEnd = segments.stream()
                .map(JourneySegment::getEndTime)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
        
        long hours = ChronoUnit.HOURS.between(firstStart, lastEnd);
        journey.setEstimatedDurationHours(BigDecimal.valueOf(hours));

        // Calculate total cost
        BigDecimal totalCost = segments.stream()
                .map(s -> s.getEstimatedCost() != null ? s.getEstimatedCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        journey.setTotalEstimatedCost(totalCost);

        // Distance calculation would require location service integration
        // For now, set a placeholder
        journey.setTotalDistanceKm(BigDecimal.valueOf(100)); // TODO: Calculate actual distance
    }

    /**
     * Convert Journey entity to DTO
     */
    private JourneyDTO convertToDTO(Journey journey) {
        return JourneyDTO.builder()
                .journeyId(journey.getJourneyId())
                .tripId(journey.getTripId())
                .userId(journey.getUserId())
                .status(journey.getStatus())
                .optimizationScore(journey.getOptimizationScore())
                .totalDistanceKm(journey.getTotalDistanceKm())
                .estimatedDurationHours(journey.getEstimatedDurationHours())
                .totalEstimatedCost(journey.getTotalEstimatedCost())
                .segments(journey.getSegments().stream()
                        .map(this::convertSegmentToDTO)
                        .collect(Collectors.toList()))
                .suggestions(journey.getSuggestions().stream()
                        .map(this::convertSuggestionToDTO)
                        .collect(Collectors.toList()))
                .waypoints(journey.getWaypoints().stream()
                        .map(this::convertWaypointToDTO)
                        .collect(Collectors.toList()))
                .createdAt(journey.getCreatedAt())
                .updatedAt(journey.getUpdatedAt())
                .build();
    }

    /**
     * Convert Segment entity to DTO
     */
    private SegmentDTO convertSegmentToDTO(JourneySegment segment) {
        return SegmentDTO.builder()
                .segmentId(segment.getSegmentId())
                .sequenceOrder(segment.getSequenceOrder())
                .segmentType(segment.getSegmentType())
                .startTime(segment.getStartTime())
                .endTime(segment.getEndTime())
                .locationFrom(segment.getLocationFrom())
                .locationTo(segment.getLocationTo())
                .latitudeFrom(segment.getLatitudeFrom())
                .longitudeFrom(segment.getLongitudeFrom())
                .latitudeTo(segment.getLatitudeTo())
                .longitudeTo(segment.getLongitudeTo())
                .bookingReference(segment.getBookingReference())
                .bookingType(segment.getBookingType())
                .bookingId(segment.getBookingId())
                .estimatedCost(segment.getEstimatedCost())
                .actualCost(segment.getActualCost())
                .status(segment.getStatus())
                .notes(segment.getNotes())
                .build();
    }

    /**
     * Convert Suggestion entity to DTO
     */
    private SuggestionDTO convertSuggestionToDTO(JourneySuggestion suggestion) {
        return SuggestionDTO.builder()
                .suggestionId(suggestion.getSuggestionId())
                .suggestionType(suggestion.getSuggestionType())
                .entityType(suggestion.getEntityType())
                .entityId(suggestion.getEntityId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .estimatedCost(suggestion.getEstimatedCost())
                .priority(suggestion.getPriority())
                .relevanceScore(suggestion.getRelevanceScore())
                .isAccepted(suggestion.getIsAccepted())
                .isDismissed(suggestion.getIsDismissed())
                .metadata(suggestion.getMetadata())
                .createdAt(suggestion.getCreatedAt())
                .expiresAt(suggestion.getExpiresAt())
                .build();
    }

    /**
     * Convert Waypoint entity to DTO
     */
    private WaypointDTO convertWaypointToDTO(JourneyWaypoint waypoint) {
        return WaypointDTO.builder()
                .waypointId(waypoint.getWaypointId())
                .sequenceOrder(waypoint.getSequenceOrder())
                .locationName(waypoint.getLocationName())
                .latitude(waypoint.getLatitude())
                .longitude(waypoint.getLongitude())
                .waypointType(waypoint.getWaypointType())
                .arrivalTime(waypoint.getArrivalTime())
                .departureTime(waypoint.getDepartureTime())
                .durationMinutes(waypoint.getDurationMinutes())
                .isMandatory(waypoint.getIsMandatory())
                .build();
    }
}
