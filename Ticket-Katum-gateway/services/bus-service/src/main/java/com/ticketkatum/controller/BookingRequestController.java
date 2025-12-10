package com.ticketkatum.controller;

import com.ticketkatum.model.BookingRequestDto;
import com.ticketkatum.model.CancelTicketRequest;
import com.ticketkatum.model.ReservationResponse;
import com.ticketkatum.service.BookingRequestService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/bookSeats")
public class BookingRequestController {
    private final BookingRequestService bookingRequestService;

    /**
     * Reserve seats for a booking
     * POST /bookSeats/{seatId}
     */
    @PostMapping("/{seatId}")
    public ResponseEntity<Response<ReservationResponse>> reserveSeats(
            @Valid @RequestBody BookingRequestDto requestDto,
            @PathVariable int seatId) {
        log.info("Reserving seat with ID: {} for customer: {}", seatId, requestDto.getSeat());

        try {
            ReservationResponse reservationResponse = bookingRequestService.rserveSeat(requestDto, seatId);
            Response<ReservationResponse> response = ResponseHandler.success(
                    "Seat reserved successfully",
                    reservationResponse
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error reserving seat: {}", seatId, e);
            Response<ReservationResponse> response = ResponseHandler.failure("Failed to reserve seat: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Cancel seat reservation
     * POST /bookSeats/cancel
     */
    @PostMapping("/cancel")
    public ResponseEntity<Response<Void>> cancelSeat(@Valid @RequestBody CancelTicketRequest cancelTicketRequest) {
        log.info("Canceling reservation for email: {}, ticket: {}",
                cancelTicketRequest.getEmail(),
                cancelTicketRequest.getTicketNo());

        try {
            bookingRequestService.cancelReservation(
                    cancelTicketRequest.getEmail(),
                    cancelTicketRequest.getTicketNo()
            );
            bookingRequestService.cancelNotification(cancelTicketRequest.getEmail());

            Response<Void> response = ResponseHandler.success("Seat has been canceled successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error canceling reservation for email: {}, ticket: {}",
                    cancelTicketRequest.getEmail(),
                    cancelTicketRequest.getTicketNo(),
                    e);
            Response<Void> response = ResponseHandler.failure("Failed to cancel seat: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}