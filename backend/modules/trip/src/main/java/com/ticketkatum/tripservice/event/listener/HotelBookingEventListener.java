package com.ticketkatum.tripservice.event.listener;

import com.ticketkatum.tripservice.entity.ItineraryDay;
import com.ticketkatum.tripservice.entity.Journey;
import com.ticketkatum.tripservice.entity.TimelineEvent;
import com.ticketkatum.tripservice.entity.Trip;
import com.ticketkatum.tripservice.entity.TripBooking;
import com.ticketkatum.tripservice.event.external.HotelBookingCreatedEvent;
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
public class HotelBookingEventListener {

    private final TripRepository tripRepository;
    private final ItineraryService itineraryService;

    @KafkaListener(topics = "hotel.booking.created", groupId = "trip-service-group")
    @Transactional
    public void handleHotelBookingCreated(HotelBookingCreatedEvent event) {
        log.info("Received HotelBookingCreatedEvent: {}", event);

        if (event.getTripId() == null) {
            log.warn("Hotel booking {} has no tripId, skipping linkage", event.getBookingId());
            return;
        }

        Trip trip = tripRepository.findById(event.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found: " + event.getTripId()));

        // Create Trip Booking with Details
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

            Map<String, Object> detailsMap = Map.of(
                    "hotelName", event.getHotelName() != null ? event.getHotelName() : "Unknown Hotel",
                    "roomType", event.getRoomType() != null ? event.getRoomType() : "Standard",
                    "checkIn", event.getCheckInDate(),
                    "checkOut", event.getCheckOutDate(),
                    "guests", event.getNumberOfGuests());

            TripBooking booking = TripBooking.builder()
                    .trip(trip)
                    .bookingType(TripBooking.BookingType.HOTEL)
                    .bookingId(event.getBookingId())
                    .bookingReference("HTL-" + event.getBookingId())
                    .bookingDate(LocalDateTime.now())
                    .amount(event.getTotalAmount())
                    .status(TripBooking.BookingStatus.CONFIRMED)
                    .details(mapper.writeValueAsString(detailsMap))
                    .createdAt(LocalDateTime.now())
                    .build();

            trip.getBookings().add(booking);

            // Update actual cost
            if (event.getTotalAmount() != null) {
                BigDecimal currentCost = trip.getActualCost() != null ? trip.getActualCost() : BigDecimal.ZERO;
                trip.setActualCost(currentCost.add(event.getTotalAmount()));
            }

            // Create Timeline Event
            TimelineEvent timelineEvent = TimelineEvent.builder()
                    .trip(trip)
                    .eventType(TimelineEvent.EventType.CREATED)
                    .description("Hotel booked: " + event.getHotelName())
                    .eventData(Map.of(
                            "bookingType", "HOTEL",
                            "bookingId", event.getBookingId(),
                            "hotelName", event.getHotelName(),
                            "checkIn", event.getCheckInDate().toString()))
                    .createdAt(LocalDateTime.now())
                    .build();

            trip.addTimelineEvent(timelineEvent);

            tripRepository.save(trip);
            log.info("Successfully linked Hotel Booking {} to Trip {}", event.getBookingId(), trip.getTripId());

        } catch (Exception e) {
            log.error("Failed to process Hotel Booking {}", event.getBookingId(), e);
        }
    }
}
