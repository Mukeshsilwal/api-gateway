package com.ticketkatum.journeyservice.service;

import com.ticketkatum.journeyservice.dto.BookingDTO;
import com.ticketkatum.journeyservice.dto.TripDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for integrating with external services
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationService {

    private final WebClient.Builder webClientBuilder;

    @Value("${journey.external-services.trip-service-url}")
    private String tripServiceUrl;

    @Value("${journey.external-services.booking-service-url}")
    private String bookingServiceUrl;

    /**
     * Fetch trip data from trip-service
     */
    public TripDTO getTripData(Long tripId) {
        log.info("Fetching trip data for trip: {}", tripId);
        
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(tripServiceUrl + "/api/trips/" + tripId)
                    .retrieve()
                    .bodyToMono(TripDTO.class)
                    .block();
        } catch (Exception e) {
            log.error("Error fetching trip data: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch trip data", e);
        }
    }

    /**
     * Fetch bookings for a trip from trip-service
     */
    public List<BookingDTO> getTripBookings(Long tripId) {
        log.info("Fetching bookings for trip: {}", tripId);
        
        try {
            // TODO: Implement actual API call when trip-service booking endpoint is ready
            // For now, return empty list
            return new ArrayList<>();
            
            /*
            return webClientBuilder.build()
                    .get()
                    .uri(tripServiceUrl + "/api/trips/" + tripId + "/bookings")
                    .retrieve()
                    .bodyToFlux(BookingDTO.class)
                    .collectList()
                    .block();
            */
        } catch (Exception e) {
            log.error("Error fetching trip bookings: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Fetch booking details from booking-service
     */
    public BookingDTO getBookingDetails(Long bookingId) {
        log.info("Fetching booking details for booking: {}", bookingId);
        
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(bookingServiceUrl + "/api/bookings/" + bookingId)
                    .retrieve()
                    .bodyToMono(BookingDTO.class)
                    .block();
        } catch (Exception e) {
            log.error("Error fetching booking details: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch booking details", e);
        }
    }
}
