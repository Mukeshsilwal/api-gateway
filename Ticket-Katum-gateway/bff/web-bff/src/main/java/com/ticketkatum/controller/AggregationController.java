package com.ticketkatum.controller;

import com.ticketkatum.dto.CompleteBookingRequest;
import com.ticketkatum.dto.CompleteBookingResponse;
import com.ticketkatum.dto.EnrichedHotelSearchResponse;
import com.ticketkatum.dto.HotelSearchRequest;
import com.ticketkatum.service.AggregationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/aggregation")
@RequiredArgsConstructor
public class AggregationController {

    private final AggregationService aggregationService;

    // ---------------------------------------------------------
    // COMPLETE BOOKING PROCESS
    // ---------------------------------------------------------
    @PostMapping("/booking/complete")
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<CompleteBookingResponse>> completeBooking(
            @Valid @RequestBody CompleteBookingRequest request,
            Authentication authentication) {

        final String userId = authentication != null ? authentication.getName() : "anonymous";

        log.info("Complete booking requested | user_id={}", userId);

        return aggregationService.completeBooking(request, userId)
                .map(ResponseEntity::ok)
                .doOnSuccess(res ->
                        log.info("Booking completed | booking_id={}", res.getBody().getBookingId()))
                .doOnError(err ->
                        log.error("Booking flow failed | user_id={} | error={}", userId, err.getMessage()));
    }

    // ---------------------------------------------------------
    // ENRICHED HOTEL SEARCH
    // ---------------------------------------------------------
    @PostMapping("/hotels/search")
    public Mono<ResponseEntity<EnrichedHotelSearchResponse>> searchHotels(
            @Valid @RequestBody HotelSearchRequest request) {

        log.info("Hotel search | lat={}, lon={}", request.getLatitude(), request.getLongitude());

        return aggregationService.searchHotelsWithEnrichment(request)
                .map(ResponseEntity::ok);
    }
}
