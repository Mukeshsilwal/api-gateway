package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.service.BookingSeatAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Booking BFF Controller
 * Handles booking operations with aggregated data
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/seat")
@RequiredArgsConstructor
@Tag(name = "Booking BFF", description = "Booking management aggregated APIs")
public class BookingSeatBffController {

    private final BookingSeatAggregator bookingAggregator;

    /**
     * Complete booking flow
     * Aggregates: seat check -> reserve -> book -> ticket generation
     */
    @PostMapping("/complete")
    @Operation(summary = "Complete booking flow",
            description = "Book seat with ticket generation in one call")
    public CompletableFuture<ResponseEntity<Response<CompleteBookingResponse>>> completeBooking(
            @Valid @RequestBody CompleteBookingRequest request) {

        log.info("BFF: Starting complete booking flow for seat: {}", request.getSeatId());

        return bookingAggregator.completeBookingFlow(request)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Booking completed successfully", response)))
                .exceptionally(ex -> {
                    log.error("Booking flow failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Booking failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Get booking details
     * Aggregates: booking, ticket, seat, bus info
     */
    @GetMapping("/{bookingId}/details")
    @Operation(summary = "Get booking details",
            description = "Returns complete booking information")
    public CompletableFuture<ResponseEntity<Response<AggregatedBookingDetails>>> getBookingDetails(
            @PathVariable Integer bookingId) {

        log.info("BFF: Fetching booking details for: {}", bookingId);

        return bookingAggregator.getBookingDetails(bookingId)
                .thenApply(details -> ResponseEntity.ok(
                        new Response<>(200, "Booking details retrieved", details)))
                .exceptionally(ex -> {
                    log.error("Error fetching booking", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "Booking not found", null));
                });
    }

    /**
     * Get all bookings with details
     */
    @GetMapping("/all-with-details")
    @Operation(summary = "Get all bookings with details",
            description = "Returns all bookings with complete information")
    public CompletableFuture<ResponseEntity<Response<List<AggregatedBookingDetails>>>> getAllBookingsWithDetails() {
        log.info("BFF: Fetching all bookings with details");

        return bookingAggregator.getAllBookingsWithDetails()
                .thenApply(bookings -> ResponseEntity.ok(
                        new Response<>(200, "Bookings retrieved", bookings)))
                .exceptionally(ex -> {
                    log.error("Error fetching bookings", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch bookings", null));
                });
    }

    /**
     * Cancel booking
     * Aggregates: cancellation, seat release, notification
     */
    @PostMapping("/cancel")
    @Operation(summary = "Cancel booking",
            description = "Cancel booking and release seat")
    public CompletableFuture<ResponseEntity<Response<CancellationResponse>>> cancelBooking(
            @RequestParam String email,
            @RequestParam String ticketNo) {

        log.info("BFF: Cancelling booking - email: {}, ticket: {}", email, ticketNo);

        return bookingAggregator.cancelBookingWithSeatRelease(email, ticketNo)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Booking cancelled", response)))
                .exceptionally(ex -> {
                    log.error("Cancellation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Cancellation failed", null));
                });
    }

    /**
     * Get user booking history
     */
    @GetMapping("/history")
    @Operation(summary = "Get booking history",
            description = "Get user's booking history")
    public CompletableFuture<ResponseEntity<Response<BookingHistoryResponse>>> getBookingHistory(
            @RequestParam String userEmail) {

        log.info("BFF: Fetching booking history for: {}", userEmail);

        return bookingAggregator.getUserBookingHistory(userEmail)
                .thenApply(history -> ResponseEntity.ok(
                        new Response<>(200, "History retrieved", history)))
                .exceptionally(ex -> {
                    log.error("Error fetching history", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Failed to fetch history", null));
                });
    }
}
