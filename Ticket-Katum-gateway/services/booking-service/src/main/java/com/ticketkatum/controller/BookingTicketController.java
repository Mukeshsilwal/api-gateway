package com.ticketkatum.controller;

import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.abstractfactory.provider.factory.BookingProviderFactory;
import com.ticketkatum.model.HotelBookingRequest;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingTicketController {

    private final BookingProviderFactory bookingProviderFactory;

    /**
     * BOOK TICKET
     * POST /api/booking/{category}/{service}
     */
    @PostMapping("/{category}/{service}")
    public ResponseEntity<Response> bookTicket(
            @PathVariable String category,
            @PathVariable String service,
            @RequestBody HotelBookingRequest request) {

        log.info("🎫 Booking request: category={}, service={}", category, service);

        try {
            BookingProvider provider = bookingProviderFactory.getProvider(category, service);
            Response response = provider.bookTicket(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error booking ticket: category={}, service={}", category, service, e);
            Response response = ResponseHandler.failure("Booking failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * CANCEL TICKET
     * POST /api/booking/{category}/{service}/cancel
     */
    @PostMapping("/{category}/{service}/cancel")
    public ResponseEntity<Response> cancelBooking(
            @PathVariable String category,
            @PathVariable String service,
            @RequestBody HotelBookingRequest request) {

        log.info("🚫 Cancel request: category={}, service={}", category, service);

        try {
            BookingProvider provider = bookingProviderFactory.getProvider(category, service);
            Response response = provider.cancel(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cancelling booking: category={}, service={}", category, service, e);
            Response response = ResponseHandler.failure("Cancellation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * REFUND TICKET
     * POST /api/booking/{category}/{service}/refund
     */
    @PostMapping("/{category}/{service}/refund")
    public ResponseEntity<Response> refundBooking(
            @PathVariable String category,
            @PathVariable String service,
            @RequestBody Request request) {

        log.info("💰 Refund request: category={}, service={}", category, service);

        try {
            BookingProvider provider = bookingProviderFactory.getProvider(category, service);
            Response response = provider.refund(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error refunding booking: category={}, service={}", category, service, e);
            Response response = ResponseHandler.failure("Refund failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}