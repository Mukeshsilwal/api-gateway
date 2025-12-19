package com.ticketkatum.controller;

import com.ticketkatum.model.*;
import com.ticketkatum.service.serviceimpl.RoomBookingService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management", description = "Room booking and availability operations")
public class HotelBookingController {

    private final RoomBookingService bookingService;

    @Operation(summary = "Check room availability", description = "Checks availability and returns pricing options")
    @PostMapping("/availability")
    public ResponseEntity<Response<List<AvailableRoomDto>>> checkAvailability(
            @Valid @RequestBody AvailabilityRequestDto request) {

        log.info("Checking availability for hotel: {}, dates: {} to {}",
                request.getHotelId(), request.getCheckIn(), request.getCheckOut());

        List<AvailableRoomDto> availableRooms = bookingService.findAvailableRooms(request);

        return ResponseEntity.ok(ResponseHandler.success(
                "Found " + availableRooms.size() + " available rooms",
                availableRooms));
    }

    @Operation(summary = "Calculate price", description = "Calculates exact price for a room selection")
    @PostMapping("/price")
    public ResponseEntity<Response<PricingResponseDto>> calculatePrice(
            @Valid @RequestBody PricingRequestDto request) {

        PricingResponseDto pricing = bookingService.calculatePrice(request);
        return ResponseEntity.ok(ResponseHandler.success("Price calculated successfully", pricing));
    }

    @Operation(summary = "Lock room (Initiate Booking)", description = "Locks a room for 15 minutes (Status: PENDING)")
    @PostMapping("/lock")
    public ResponseEntity<Response<BookingResponseDto>> lockRoom(
            @RequestHeader("X-User-Id") Long customerId,
            @Valid @RequestBody BookingRequestDto request) {

        log.info("Locking room for customer: {}", customerId);

        BookingResponseDto booking = bookingService.lockRoom(request, customerId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseHandler.created("Room locked successfully. Complete payment within 15 minutes.",
                        booking));
    }

    @Operation(summary = "Confirm booking", description = "Confirms a locked booking")
    @PostMapping("/{reference}/confirm")
    public ResponseEntity<Response<BookingResponseDto>> confirmBooking(
            @RequestHeader("X-User-Id") Long customerId,
            @PathVariable String reference) {

        log.info("Confirming booking: {}", reference);

        BookingResponseDto booking = bookingService.confirmBooking(reference, customerId);

        return ResponseEntity.ok(ResponseHandler.success("Booking confirmed successfully", booking));
    }

    // Deprecated or Legacy Support
    @Operation(summary = "Create booking (Immediate)", description = "Directly creates a CONFIRMED booking (Legacy)")
    @PostMapping
    public ResponseEntity<Response<BookingResponseDto>> createBooking(
            @RequestHeader("X-User-Id") Long customerId,
            @Valid @RequestBody BookingRequestDto request) {

        // For backward compatibility, calling lock then confirm immediately
        BookingResponseDto locked = bookingService.lockRoom(request, customerId);
        BookingResponseDto confirmed = bookingService.confirmBooking(locked.getBookingReference(), customerId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseHandler.created("Booking created successfully", confirmed));
    }

    @Operation(summary = "Get booking", description = "Retrieves booking details by reference")
    @GetMapping("/{reference}")
    public ResponseEntity<Response<BookingResponseDto>> getBooking(
            @PathVariable String reference) {

        BookingResponseDto booking = bookingService.getBooking(reference);
        return ResponseEntity.ok(ResponseHandler.success("Booking retrieved successfully", booking));
    }

    @Operation(summary = "Get customer bookings", description = "Retrieves all bookings for a customer")
    @GetMapping("/customer")
    public ResponseEntity<Response<List<BookingResponseDto>>> getCustomerBookings(
            @RequestHeader("X-User-Id") Long customerId) {

        List<BookingResponseDto> bookings = bookingService.getCustomerBookings(customerId);
        return ResponseEntity.ok(ResponseHandler.success("Found " + bookings.size() + " bookings", bookings));
    }

    @Operation(summary = "Cancel booking", description = "Cancels an existing booking")
    @PostMapping("/{reference}/cancel")
    public ResponseEntity<Response<Void>> cancelBooking(
            @RequestHeader("X-User-Id") Long customerId,
            @PathVariable String reference) {

        bookingService.cancelBooking(reference, customerId);
        return ResponseEntity.ok(ResponseHandler.success("Booking cancelled successfully"));
    }
}
