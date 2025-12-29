package com.ticketkatum.controller;

import com.google.zxing.WriterException;
import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.EventBooking;
import com.ticketkatum.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * Booking Controller
 * REST API for ticket bookings
 */
@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Ticket booking APIs")
public class EventBookingController {

    private final BookingService bookingService;

    @PostMapping("/event")
    @Operation(summary = "Book event tickets")
    public ResponseEntity<Response<EventBooking>> bookTickets(@RequestBody Map<String, Object> bookingData) {
        try {
            EventBooking booking = bookingService.bookTickets(bookingData);
            return ResponseEntity.ok(Response.success("Booking created successfully", booking));
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error(500, "Error generating QR code"));
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @GetMapping("/event/{reference}")
    @Operation(summary = "Get booking by reference")
    public ResponseEntity<Response<EventBooking>> getBooking(@PathVariable("reference") String reference) {
        try {
            EventBooking booking = bookingService.getBooking(reference);
            return ResponseEntity.ok(Response.success(booking));
        } catch (Exception e) {
            log.error("Error fetching booking", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Response.error(404, e.getMessage()));
        }
    }

    @PostMapping("/event/{reference}/confirm")
    @Operation(summary = "Confirm booking payment")
    public ResponseEntity<Response<EventBooking>> confirmPayment(
            @PathVariable("reference") String reference,
            @RequestBody Map<String, String> paymentData) {
        try {
            String paymentId = paymentData.get("paymentId");
            EventBooking booking = bookingService.confirmPayment(reference, paymentId);
            return ResponseEntity.ok(Response.success("Payment confirmed", booking));
        } catch (Exception e) {
            log.error("Error confirming payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }

    @PostMapping("/event/{reference}/cancel")
    @Operation(summary = "Cancel booking")
    public ResponseEntity<Response<EventBooking>> cancelBooking(
            @PathVariable("reference") String reference,
            @RequestBody Map<String, String> cancelData) {
        try {
            String reason = cancelData.get("reason");
            EventBooking booking = bookingService.cancelBooking(reference, reason);
            return ResponseEntity.ok(Response.success("Booking cancelled", booking));
        } catch (Exception e) {
            log.error("Error cancelling booking", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }
}
