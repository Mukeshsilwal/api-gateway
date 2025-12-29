package com.ticketkatum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripBookingService {

    private final WebClient.Builder webClientBuilder;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${services.trip-service.url:http://localhost:8087/trip-service}")
    private String tripServiceUrl;

    private static final String BOOKING_EVENTS_TOPIC = "booking-events";

    /**
     * Associate a booking with a trip
     */
    public void associateBookingWithTrip(Long tripId, String bookingType, String bookingId,
            String bookingReference, java.math.BigDecimal amount) {
        log.info("Associating {} booking {} with trip {}", bookingType, bookingId, tripId);

        try {
            Map<String, Object> request = new HashMap<>();
            request.put("bookingType", bookingType);
            request.put("bookingId", bookingId);
            request.put("bookingReference", bookingReference);
            request.put("bookingDate", LocalDateTime.now());
            request.put("amount", amount);
            request.put("status", "CONFIRMED");

            webClientBuilder.build()
                    .post()
                    .uri(tripServiceUrl + "/api/trips/" + tripId + "/bookings")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .doOnSuccess(v -> {
                        log.info("Successfully associated booking {} with trip {}", bookingId, tripId);
                        publishBookingAssociatedEvent(tripId, bookingType, Long.valueOf(bookingId));
                    })
                    .doOnError(e -> log.error("Failed to associate booking with trip"))
                    .onErrorResume(e -> Mono.empty())
                    .subscribe();

        } catch (Exception e) {
            log.error("Error associating booking with trip", e);
        }
    }

    /**
     * Get all bookings for a trip
     */
    public Mono<Map<String, Object>> getTripBookings(Long tripId) {
        log.debug("Fetching bookings for trip: {}", tripId);

        return webClientBuilder.build()
                .get()
                .uri(tripServiceUrl + "/api/trips/" + tripId + "/bookings")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .doOnSuccess(bookings -> log.debug("Retrieved {} bookings for trip {}",
                        bookings != null ? bookings : 0, tripId))
                .doOnError(e -> log.error("Failed to fetch trip bookings"))
                .onErrorReturn(new HashMap<>());
    }

    private void publishBookingAssociatedEvent(Long tripId, String bookingType, Long bookingId) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "booking.associated");
            event.put("tripId", tripId);
            event.put("bookingType", bookingType);
            event.put("bookingId", bookingId);
            event.put("timestamp", LocalDateTime.now());

            kafkaTemplate.send(BOOKING_EVENTS_TOPIC, tripId.toString(), event);
            log.info("Published booking.associated event for trip {}", tripId);
        } catch (Exception e) {
            log.error("Failed to publish booking associated event", e);
        }
    }
}
