package com.ticketkatum.tripservice.event.listener;

import com.ticketkatum.tripservice.entity.TimelineEvent;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.entity.TripBooking;
import com.ticketkatum.tripservice.event.external.EventBookingCreatedEvent;
import com.ticketkatum.tripservice.repository.TripRepository;
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
public class EventBookingEventListener {

    private final TripRepository tripRepository;

    @KafkaListener(topics = "event.booking.created", groupId = "trip-service-group")
    @Transactional
    public void handleEventBookingCreated(EventBookingCreatedEvent event) {
        log.info("Received EventBookingCreatedEvent: {}", event);

        Trip trip = null;

        // Case 1: Booking Update (Confirmation) - Look up via bookingId
        if (event.getTripId() == null) {
            trip = tripRepository.findTripByBookingIdAndType(event.getBookingId(), TripBooking.BookingType.EVENT)
                    .orElse(null);

            if (trip == null) {
                log.warn("Event booking {} update received but no associated trip found. Skipping.",
                        event.getBookingId());
                return;
            }
        }
        // Case 2: New Booking - Look up via tripId
        else {
            trip = tripRepository.findById(event.getTripId())
                    .orElseThrow(() -> new RuntimeException("Trip not found: " + event.getTripId()));
        }

        try {
            // Check if booking already exists
            TripBooking existingBooking = trip.getBookings().stream()
                    .filter(b -> b.getBookingId().equals(event.getBookingId())
                            && b.getBookingType() == TripBooking.BookingType.EVENT)
                    .findFirst()
                    .orElse(null);

            if (existingBooking != null) {
                // Update existing booking
                log.info("Updating existing Event Booking {} for Trip {}", event.getBookingId(), trip.getTripId());
                if (event.getStatus() != null) {
                    try {
                        existingBooking.setStatus(TripBooking.BookingStatus.valueOf(event.getStatus()));
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid status {} for booking {}", event.getStatus(), event.getBookingId());
                    }
                }
                // Update other fields if necessary (omitted for brevity, usually status is the
                // main update)
            } else {
                // Create new booking
                log.info("Creating new Event Booking {} for Trip {}", event.getBookingId(), trip.getTripId());

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

                Map<String, Object> detailsMap = Map.of(
                        "eventName", event.getEventName() != null ? event.getEventName() : "Unknown Event",
                        "location", event.getLocation() != null ? event.getLocation() : "Unknown Location",
                        "eventDate", event.getEventDate() != null ? event.getEventDate() : LocalDateTime.now(),
                        "ticketType", event.getTicketType() != null ? event.getTicketType() : "General",
                        "ticketCount", event.getTicketCount() != null ? event.getTicketCount() : 1);

                TripBooking.BookingStatus status = TripBooking.BookingStatus.PENDING;
                if (event.getStatus() != null) {
                    try {
                        status = TripBooking.BookingStatus.valueOf(event.getStatus());
                    } catch (Exception e) {
                        /* ignore */}
                }

                TripBooking booking = TripBooking.builder()
                        .trip(trip)
                        .bookingType(TripBooking.BookingType.EVENT)
                        .bookingId(event.getBookingId())
                        .bookingReference("EVT-" + event.getBookingId())
                        .bookingDate(LocalDateTime.now())
                        .amount(event.getTotalAmount())
                        .status(status)
                        .details(mapper.writeValueAsString(detailsMap))
                        .createdAt(LocalDateTime.now())
                        .build();

                trip.getBookings().add(booking);

                // Update actual cost if confirmed
                if (status == TripBooking.BookingStatus.CONFIRMED && event.getTotalAmount() != null) {
                    BigDecimal currentCost = trip.getActualCost() != null ? trip.getActualCost() : BigDecimal.ZERO;
                    trip.setActualCost(currentCost.add(event.getTotalAmount()));
                }

                // Create Timeline Event
                TimelineEvent timelineEvent = TimelineEvent.builder()
                        .trip(trip)
                        .eventType(TimelineEvent.EventType.CREATED)
                        .description("Event booked: " + event.getEventName())
                        .eventData(Map.of(
                                "bookingType", "EVENT",
                                "bookingId", event.getBookingId(),
                                "eventName", event.getEventName(),
                                "eventDate", String.valueOf(event.getEventDate())))
                        .createdAt(LocalDateTime.now())
                        .build();

                trip.addTimelineEvent(timelineEvent);
            }

            tripRepository.save(trip);
            log.info("Successfully processed Event Booking {} for Trip {}", event.getBookingId(), trip.getTripId());

        } catch (Exception e) {
            log.error("Failed to process Event Booking {}", event.getBookingId(), e);
        }
    }
}
