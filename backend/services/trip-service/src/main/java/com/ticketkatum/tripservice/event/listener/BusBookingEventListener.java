package com.ticketkatum.tripservice.event.listener;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import com.ticketkatum.tripservice.entity.Journey;
import com.ticketkatum.tripservice.entity.TimelineEvent;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.event.external.BusBookingCreatedEvent;
import com.ticketkatum.tripservice.repository.ItineraryDayRepository;
import com.ticketkatum.tripservice.repository.TripRepository;
import com.ticketkatum.tripservice.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BusBookingEventListener {

    private final TripRepository tripRepository;
    private final ItineraryService itineraryService;

    @KafkaListener(topics = "bus.booking.created", groupId = "trip-service-group")
    @Transactional
    public void handleBusBookingCreated(BusBookingCreatedEvent event) {
        log.info("Received BusBookingCreatedEvent: {}", event);

        if (event.getTripId() == null) {
            log.warn("Bus booking {} has no tripId, skipping journey creation", event.getBookingId());
            return;
        }

        Trip trip = tripRepository.findById(event.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found: " + event.getTripId()));

        // 1. Ensure Itinerary Day exists
        ItineraryDay itineraryDay = itineraryService.ensureDayForDate(event.getTripId(),
                event.getDepartureTime().toLocalDate());

        // 2. Create Journey
        Journey journey = Journey.builder()
                .trip(trip)
                .userId(event.getUserId())
                .status(Journey.JourneyStatus.PLANNED)
                .itineraryDay(itineraryDay)
                .bookingReference(Map.of(
                        "type", "BUS",
                        "bookingId", event.getBookingId(),
                        "source", event.getSource(),
                        "destination", event.getDestination(),
                        "departureTime", event.getDepartureTime().toString()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        trip.addJourney(journey);

        // 3. Create Timeline Event (Internal Projection)
        TimelineEvent timelineEvent = TimelineEvent.builder()
                .trip(trip)
                .eventType(TimelineEvent.EventType.CREATED)
                .description("Bus journey created from " + event.getSource() + " to " + event.getDestination())
                .eventData(Map.of(
                        "journeyId", "PENDING", // Generated after save, but transaction handles it
                        "source", event.getSource(),
                        "destination", event.getDestination()))
                .createdAt(LocalDateTime.now())
                .build();

        trip.addTimelineEvent(timelineEvent);

        tripRepository.save(trip);
        log.info("Successfully linked Bus Booking {} to Trip {}", event.getBookingId(), trip.getTripId());
    }
}
