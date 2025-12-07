package com.ticketkatum.controller;

import com.ticketkatum.service.WebBffAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * Booking BFF Controller
 * Handles booking operations with aggregated hotel and payment data
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking BFF", description = "Booking management aggregated APIs")
public class BookingBffController {

    private final WebBffAggregator aggregator;
    private final BookingServiceClient bookingClient;

    /**
     * Complete booking flow with hotel and payment
     * Aggregates: availability check, booking, payment initiation
     */
    @PostMapping("/complete")
    @Operation(summary = "Complete booking flow",
            description = "Book hotel with payment in a single transaction")
    public CompletableFuture<ResponseEntity<Response<CompleteBookingResponse>>> completeBooking(
            @Valid @RequestBody CompleteBookingRequest request) {

        log.info("BFF: Complete booking flow for user: {}", request.getUserId());

        return aggregator.completeBookingFlow(request)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Booking completed successfully", response)))
                .exceptionally(ex -> {
                    log.error("Booking flow failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Booking failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Book ticket
     */
    @PostMapping("/{category}/{service}")
    @Operation(summary = "Book ticket", description = "Create new booking")
    public CompletableFuture<ResponseEntity<Response<BookingResponse>>> bookTicket(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody HotelBookingRequest request) {

        log.info("BFF: Booking ticket - category: {}, service: {}", category, service);

        return bookingClient.bookTicket(category, service, request)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Booking created", response)))
                .exceptionally(ex -> {
                    log.error("Booking failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Booking failed", null));
                });
    }

    /**
     * Cancel booking with refund
     * Aggregates: cancellation, refund processing
     */
    @PostMapping("/{category}/{service}/cancel")
    @Operation(summary = "Cancel booking with refund",
            description = "Cancel booking and process refund")
    public CompletableFuture<ResponseEntity<Response<CancellationResponse>>> cancelBooking(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody HotelBookingRequest request,
            @RequestParam(required = false) String reason) {

        log.info("BFF: Cancelling booking - category: {}, service: {}", category, service);

        return aggregator.cancelBookingWithRefund(category, service, request, reason)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Booking cancelled", response)))
                .exceptionally(ex -> {
                    log.error("Cancellation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Cancellation failed", null));
                });
    }

    /**
     * Request refund
     */
    @PostMapping("/{category}/{service}/refund")
    @Operation(summary = "Request refund", description = "Process booking refund")
    public CompletableFuture<ResponseEntity<Response<RefundResponse>>> refundBooking(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody RefundRequest request) {

        log.info("BFF: Refund request for booking: {}", request.getBookingId());

        return bookingClient.refundBooking(category, service, request)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Refund processed", response)))
                .exceptionally(ex -> {
                    log.error("Refund failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Refund failed", null));
                });
    }

    /**
     * Get booking details
     * Aggregates: booking info, hotel details, payment status
     */
    @GetMapping("/{bookingId}/details")
    @Operation(summary = "Get booking details",
            description = "Get complete booking information")
    public CompletableFuture<ResponseEntity<Response<BookingDetailsResponse>>> getBookingDetails(
            @PathVariable String bookingId) {

        log.info("BFF: Fetching booking details: {}", bookingId);

        return aggregator.getBookingDetails(bookingId)
                .thenApply(details -> ResponseEntity.ok(
                        new Response<>(200, "Booking details retrieved", details)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch booking details", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "Booking not found", null));
                });
    }

    /**
     * Get booking history
     */
    @GetMapping("/history")
    @Operation(summary = "Get booking history",
            description = "Get user's booking history with pagination")
    public CompletableFuture<ResponseEntity<Response<BookingHistoryResponse>>> getBookingHistory(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        log.info("BFF: Fetching booking history for user: {}", userId);

        // TODO: Implement actual booking history fetch
        BookingHistoryResponse response = BookingHistoryResponse.builder()
                .bookings(java.util.Collections.emptyList())
                .totalBookings(0)
                .totalPages(0)
                .currentPage(page)
                .statistics(new UserStatistics())
                .build();

        return CompletableFuture.completedFuture(
                ResponseEntity.ok(new Response<>(200, "History retrieved", response))
        );
    }
}
