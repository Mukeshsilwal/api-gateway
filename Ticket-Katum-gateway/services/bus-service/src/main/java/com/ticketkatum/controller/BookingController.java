package com.ticketkatum.controller;

import com.ticketkatum.model.BookingTicketDto;
import com.ticketkatum.service.BookingTicketService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingTicketService bookingTicketService;

    /**
     * Get all booking tickets
     * GET /booking/get
     */
    @GetMapping("/get")
    public ResponseEntity<Response<List<BookingTicketDto>>> getAllBookingTicket() {
        log.info("Fetching all booking tickets");

        try {
            List<BookingTicketDto> bookingTicket = bookingTicketService.getAllBooking();
            Response<List<BookingTicketDto>> response = ResponseHandler.success(
                    "Found " + bookingTicket.size() + " booking tickets",
                    bookingTicket
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching booking tickets", e);
            Response<List<BookingTicketDto>> response = ResponseHandler.failure(
                    "Failed to fetch bookings: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get booking ticket by ID
     * GET /booking/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Response<BookingTicketDto>> getBookingTicketById(@PathVariable Integer id) {
        log.info("Fetching booking ticket with ID: {}", id);

        try {
            BookingTicketDto ticketDto = bookingTicketService.getBooking(id);
            Response<BookingTicketDto> response = ResponseHandler.success(
                    "Booking ticket fetched successfully",
                    ticketDto
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching booking ticket: {}", id, e);
            Response<BookingTicketDto> response = ResponseHandler.failure(
                    "Booking not found: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Create booking
     * POST /booking/post
     */
    @PostMapping("/post")
    public ResponseEntity<Response<BookingTicketDto>> createBooking(
            @RequestBody BookingTicketDto bookingTicketDto) {

        log.info("Creating new booking");

        try {
            BookingTicketDto ticketDto = bookingTicketService.createBooking(bookingTicketDto);
            Response<BookingTicketDto> response = ResponseHandler.success(
                    "Booking created successfully",
                    ticketDto
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating booking", e);
            Response<BookingTicketDto> response = ResponseHandler.failure(
                    "Failed to create booking: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}