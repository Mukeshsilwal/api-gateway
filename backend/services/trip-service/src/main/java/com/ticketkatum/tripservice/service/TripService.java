package com.ticketkatum.tripservice.service;

import com.ticketkatum.tripservice.dto.TripDTO;
import com.ticketkatum.tripservice.dto.request.CreateTripRequest;
import com.ticketkatum.tripservice.dto.request.UpdateTripRequest;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.entity.TripBooking;
import com.ticketkatum.tripservice.entity.TripCheckpoint;
import com.ticketkatum.tripservice.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TRIP_EVENTS_TOPIC = "trip-events";

    @Transactional
    public TripDTO createTrip(Long userId, CreateTripRequest request) {
        log.info("Creating trip for user: {}, tripName: {}", userId, request.getTripName());

        Trip trip = Trip.builder()
                .userId(userId)
                .guideId(request.getGuideId())
                .tripName(request.getTripName())
                .tripType(request.getTripType())
                .touristType(request.getTouristType())
                .status(Trip.TripStatus.PLANNED)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .budget(request.getBudget())
                .actualCost(BigDecimal.ZERO)
                .description(request.getDescription())
                .build();

        Trip savedTrip = tripRepository.save(trip);
        log.info("Trip created successfully with ID: {}", savedTrip.getTripId());

        // Publish trip created event
        publishTripEvent("trip.created", savedTrip);

        return TripDTO.fromEntity(savedTrip);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "trips", key = "#tripId")
    public TripDTO getTripById(Long tripId) {
        log.debug("Fetching trip by ID: {}", tripId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        return TripDTO.fromEntity(trip);
    }

    @Transactional(readOnly = true)
    // Caching disabled due to lazy-loaded collections causing serialization issues
    public TripDTO getTripWithDetails(Long tripId) {
        log.debug("Fetching trip with details by ID: {}", tripId);
        Trip trip = tripRepository.findByIdWithDetails(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
        return TripDTO.fromEntityWithDetails(trip);
    }

    @Transactional(readOnly = true)
    public List<TripDTO> getUserTrips(Long userId) {
        log.debug("Fetching trips for user: {}", userId);
        List<Trip> trips = tripRepository.findByUserId(userId);
        return trips.stream()
                .map(TripDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TripDTO> getUserTripsByStatus(Long userId, Trip.TripStatus status) {
        log.debug("Fetching trips for user: {} with status: {}", userId, status);
        List<Trip> trips = tripRepository.findByUserIdAndStatus(userId, status);
        return trips.stream()
                .map(TripDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TripDTO> getActiveTrips() {
        log.debug("Fetching active trips");
        LocalDate today = LocalDate.now();
        List<Trip> trips = tripRepository.findActiveTrips(today);
        return trips.stream()
                .map(TripDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "trips", allEntries = true)
    public TripDTO updateTrip(Long tripId, UpdateTripRequest request) {
        log.info("Updating trip: {}", tripId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        // Update fields if provided
        if (request.getTripName() != null) {
            trip.setTripName(request.getTripName());
        }
        if (request.getStatus() != null) {
            Trip.TripStatus oldStatus = trip.getStatus();
            trip.setStatus(request.getStatus());

            // Publish status change events
            if (oldStatus != request.getStatus()) {
                handleStatusChange(trip, oldStatus, request.getStatus());
            }
        }
        if (request.getStartDate() != null) {
            trip.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            trip.setEndDate(request.getEndDate());
        }
        if (request.getBudget() != null) {
            trip.setBudget(request.getBudget());
        }
        if (request.getDescription() != null) {
            trip.setDescription(request.getDescription());
        }
        if (request.getGuideId() != null) {
            trip.setGuideId(request.getGuideId());
        }

        Trip updatedTrip = tripRepository.save(trip);
        log.info("Trip updated successfully: {}", tripId);

        // Publish trip updated event
        publishTripEvent("trip.updated", updatedTrip);

        return TripDTO.fromEntity(updatedTrip);
    }

    @Transactional
    @CacheEvict(value = "trips", allEntries = true)
    public void deleteTrip(Long tripId) {
        log.info("Deleting trip: {}", tripId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        trip.setStatus(Trip.TripStatus.CANCELLED);
        tripRepository.save(trip);

        log.info("Trip cancelled successfully: {}", tripId);

        // Publish trip cancelled event
        publishTripEvent("trip.cancelled", trip);
    }

    @Transactional
    @CacheEvict(value = "trips", allEntries = true)
    public TripDTO updateTripStatus(Long tripId, Trip.TripStatus newStatus) {
        log.info("Updating trip status: {} to {}", tripId, newStatus);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        Trip.TripStatus oldStatus = trip.getStatus();
        trip.setStatus(newStatus);

        Trip updatedTrip = tripRepository.save(trip);

        // Handle status change
        handleStatusChange(updatedTrip, oldStatus, newStatus);

        return TripDTO.fromEntity(updatedTrip);
    }

    @Transactional
    public void updateActualCost(Long tripId, BigDecimal additionalCost) {
        log.info("Updating actual cost for trip: {} by {}", tripId, additionalCost);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        BigDecimal currentCost = trip.getActualCost() != null ? trip.getActualCost() : BigDecimal.ZERO;
        trip.setActualCost(currentCost.add(additionalCost));

        tripRepository.save(trip);
        log.info("Actual cost updated for trip: {}", tripId);
    }

    private void handleStatusChange(Trip trip, Trip.TripStatus oldStatus, Trip.TripStatus newStatus) {
        log.info("Trip {} status changed from {} to {}", trip.getTripId(), oldStatus, newStatus);

        switch (newStatus) {
            case IN_PROGRESS:
                publishTripEvent("trip.started", trip);
                // Update all pending checkpoints to in-progress for the first one
                updateCheckpointsOnTripStart(trip);
                break;
            case COMPLETED:
                publishTripEvent("trip.completed", trip);
                // Mark all checkpoints as completed
                completeAllCheckpoints(trip);
                break;
            case CANCELLED:
                publishTripEvent("trip.cancelled", trip);
                // Cancel all pending checkpoints
                cancelAllCheckpoints(trip);
                break;
            default:
                break;
        }
    }

    private void updateCheckpointsOnTripStart(Trip trip) {
        // This would be implemented to update the first checkpoint to IN_PROGRESS
        log.debug("Updating checkpoints for trip start: {}", trip.getTripId());
    }

    private void completeAllCheckpoints(Trip trip) {
        // This would be implemented to mark all checkpoints as completed
        log.debug("Completing all checkpoints for trip: {}", trip.getTripId());
    }

    private void cancelAllCheckpoints(Trip trip) {
        // This would be implemented to cancel all pending checkpoints
        log.debug("Cancelling all checkpoints for trip: {}", trip.getTripId());
    }

    private void publishTripEvent(String eventType, Trip trip) {
        try {
            TripEvent event = TripEvent.builder()
                    .eventType(eventType)
                    .tripId(trip.getTripId())
                    .userId(trip.getUserId())
                    .tripName(trip.getTripName())
                    .status(trip.getStatus().name())
                    .startDate(trip.getStartDate())
                    .endDate(trip.getEndDate())
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            kafkaTemplate.send(TRIP_EVENTS_TOPIC, trip.getTripId().toString(), event);
            log.info("Published {} event for trip: {}", eventType, trip.getTripId());
        } catch (Exception e) {
            log.error("Failed to publish trip event: {}", eventType, e);
            // Don't fail the transaction if event publishing fails
        }
    }

    @Transactional
    public void handleBookingFailure(Long tripId, Long failedBookingId, String reason) {
        log.warn("Handling booking failure for trip: {}, booking: {}. Reason: {}", tripId, failedBookingId, reason);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        // Mark as PARTIAL_BOOKING if some bookings succeeded but this one failed
        if (!trip.getBookings().isEmpty()) {
            trip.setStatus(Trip.TripStatus.PARTIAL_BOOKING);
            log.info("Trip {} marked as PARTIAL_BOOKING due to booking failure", tripId);

            // Trigger Alert for user intervention
            publishTripEvent("trip.booking_failed_partial", trip);
        } else {
            // If no bookings yet, maybe just log or keep as PLANNED
            log.info("Trip {} has no successful bookings yet, keeping status: {}", tripId, trip.getStatus());
        }

        tripRepository.save(trip);
    }

    @Transactional
    public void compensateTrip(Long tripId) {
        log.info("Compensating (rolling back) trip: {}", tripId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        // Logic to trigger refunds for existing bookings would go here
        // For MVP, we just mark as CANCELLED and alert admin
        trip.setStatus(Trip.TripStatus.CANCELLED);
        tripRepository.save(trip);

        publishTripEvent("trip.compensated", trip);
    }

    @Transactional
    public void addBookingToTrip(Long tripId, java.util.Map<String, Object> bookingRequest) {
        log.info("Adding booking to trip: {}", tripId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        // Create TripBooking entity
        TripBooking booking = new TripBooking();
        booking.setTrip(trip);
        booking.setBookingType(TripBooking.BookingType.valueOf((String) bookingRequest.get("bookingType")));
        booking.setBookingId(((Number) bookingRequest.get("bookingId")).longValue());
        booking.setBookingReference((String) bookingRequest.get("bookingReference"));
        booking.setBookingDate((java.time.LocalDateTime) bookingRequest.get("bookingDate"));
        booking.setAmount((BigDecimal) bookingRequest.get("amount"));
        booking.setStatus(TripBooking.BookingStatus.valueOf((String) bookingRequest.get("status")));

        trip.getBookings().add(booking);

        // Update actual cost
        BigDecimal amount = (BigDecimal) bookingRequest.get("amount");
        if (amount != null) {
            updateActualCost(tripId, amount);
        }

        tripRepository.save(trip);
        log.info("Booking added to trip: {}", tripId);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getTripBookings(Long tripId) {
        log.debug("Fetching bookings for trip: {}", tripId);

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        return trip.getBookings().stream()
                .map(booking -> {
                    java.util.Map<String, Object> bookingMap = new java.util.HashMap<>();
                    bookingMap.put("id", booking.getId());
                    bookingMap.put("bookingType", booking.getBookingType().name());
                    bookingMap.put("bookingId", booking.getBookingId());
                    bookingMap.put("bookingReference", booking.getBookingReference());
                    bookingMap.put("bookingDate", booking.getBookingDate());
                    bookingMap.put("amount", booking.getAmount());
                    bookingMap.put("status", booking.getStatus().name());
                    return bookingMap;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    // Inner class for Kafka events
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TripEvent {
        private String eventType;
        private Long tripId;
        private Long userId;
        private String tripName;
        private String status;
        private LocalDate startDate;
        private LocalDate endDate;
        private java.time.LocalDateTime timestamp;
    }
}
