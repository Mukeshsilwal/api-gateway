package com.ticketkatum.controller;

import com.ticketkatum.client.BookingServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.booking.request.CompleteBookingRequest;
import com.ticketkatum.dto.booking.response.BookingDetailsResponse;
import com.ticketkatum.dto.booking.response.BookingHistoryResponse;
import com.ticketkatum.dto.booking.response.CompleteBookingResponse;
import com.ticketkatum.dto.hotel.request.HotelBookingRequest;
import com.ticketkatum.dto.hotel.request.RefundRequest;
import com.ticketkatum.dto.hotel.response.BookingResponse;
import com.ticketkatum.dto.hotel.response.CancellationResponse;
import com.ticketkatum.dto.hotel.response.HotelBookingResponse;
import com.ticketkatum.dto.hotel.response.RefundResponse;
import com.ticketkatum.exception.*;
import com.ticketkatum.service.BookingAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/bff/v1/bookings")
@RequiredArgsConstructor
@Validated
@Tag(name = "Booking BFF", description = "Booking management aggregated APIs")
public class BookingBffController {

    private final BookingAggregator bookingAggregator;
    private final BookingServiceClient bookingClient;
    private static final long OPERATION_TIMEOUT_SECONDS = 30;

    @PostMapping("/complete")
    @Operation(summary = "Complete booking flow",
            description = "Book hotel with payment in a single transaction. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<CompleteBookingResponse>>> completeBooking(
            @Valid @RequestBody CompleteBookingRequest request) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Complete booking flow for user: {}", correlationId, request.getUserId());


        return bookingAggregator.completeBookingFlow(request)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<CompleteBookingResponse>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Booking completed successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Complete booking");
                });
    }

    @PostMapping("/{category}/{service}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Book ticket", description = "Create new booking. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<HotelBookingResponse>>> bookTicket(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody HotelBookingRequest request) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Booking ticket - category: {}, service: {}",
                correlationId, category, service);

        return bookingClient.bookTicket(category, service, request)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Booking created successfully: bookingId={}",
                            correlationId, response.getBookingId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(
                            Response.<HotelBookingResponse>builder()
                                    .statusCode(HttpStatus.CREATED.value())
                                    .message("Booking created successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Book ticket");
                });
    }

    @PostMapping("/{category}/{service}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel booking with refund",
            description = "Cancel booking and process refund. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<CancellationResponse>>> cancelBooking(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody HotelBookingRequest request,
            @RequestParam(required = false) String reason) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Cancelling booking - category: {}, service: {}, reason: {}",
                correlationId, category, service, reason);


        return bookingAggregator.cancelBookingWithRefund(category, service, request, reason)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Booking cancelled successfully: bookingId={}",
                            correlationId, response.getBookingId());
                    return ResponseEntity.ok(
                            Response.<CancellationResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Booking cancelled successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Cancel booking");
                });
    }

    @PostMapping("/{category}/{service}/refund")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Request refund", description = "Process booking refund. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<RefundResponse>>> refundBooking(
            @PathVariable String category,
            @PathVariable String service,
            @Valid @RequestBody RefundRequest request) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Refund request for booking: {}", correlationId, request.getBookingId());

        return bookingClient.refundBooking(category, service, request)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(response -> {
                    log.info("[{}] Refund processed successfully: refundId={}",
                            correlationId, response.getRefundId());
                    return ResponseEntity.ok(
                            Response.<RefundResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Refund processed successfully")
                                    .data(response)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Process refund");
                });
    }

    @GetMapping("/{bookingId}/details")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get booking details",
            description = "Get complete booking information. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<BookingDetailsResponse>>> getBookingDetails(
            @PathVariable String bookingId) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching booking details: {}", correlationId, bookingId);


        return bookingAggregator.getBookingDetails(bookingId)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(details -> {
                    log.info("[{}] Booking details retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<BookingDetailsResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Booking details retrieved successfully")
                                    .data(details)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get booking details");
                });
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get booking history",
            description = "Get user's booking history with pagination. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<BookingHistoryResponse>>> getBookingHistory(
            @RequestParam @Min(1) Integer userId,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "10") @Min(1) Integer size) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching booking history for user: {}, page: {}, size: {}",
                correlationId, userId, page, size);


        return bookingAggregator.getBookingHistory(userId, page, size)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(history -> {

                    return ResponseEntity.ok(
                            Response.<BookingHistoryResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Booking history retrieved successfully")
                                    .data(history)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get booking history");
                });
    }

    @GetMapping("/upcoming")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get upcoming bookings",
            description = "Get user's upcoming bookings. Requires authentication.")
    public CompletableFuture<ResponseEntity<Response<BookingHistoryResponse>>> getUpcomingBookings(
            @RequestParam @Min(1) Integer userId,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "10") @Min(1) Integer size) {

        String correlationId = UUID.randomUUID().toString();
        log.info("[{}] BFF: Fetching upcoming bookings for user: {}", correlationId, userId);


        return bookingAggregator.getBookingHistory(userId, page, size)
                .orTimeout(OPERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .thenApply(history -> {
                    log.info("[{}] Upcoming bookings retrieved successfully", correlationId);
                    return ResponseEntity.ok(
                            Response.<BookingHistoryResponse>builder()
                                    .statusCode(HttpStatus.OK.value())
                                    .message("Upcoming bookings retrieved successfully")
                                    .data(history)
                                    .build());
                })
                .exceptionally(ex -> {
                    throw handleAsyncException(ex, correlationId, "Get upcoming bookings");
                });
    }

    private RuntimeException handleAsyncException(Throwable ex, String correlationId, String operation) {
        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        log.error("[{}] {} failed: {}", correlationId, operation, cause.getMessage(), cause);

        if (cause instanceof RuntimeException) {
            return (RuntimeException) cause;
        }
        return new BusinessException("OPERATION_FAILED",
                operation + " failed: " + cause.getMessage(), cause);
    }
}