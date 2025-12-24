package com.ticketkatum.controller;

import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.abstractfactory.provider.factory.BookingProviderFactory;
import com.ticketkatum.model.HotelBookingRequest;
import com.ticketkatum.model.HotelBookingResponse;
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
    private final com.ticketkatum.service.BookingOrchestrator bookingOrchestrator;

    /**
     * BOOK TICKET
     * POST /api/booking/{category}/{service}
     */
    @PostMapping("/{category}/{service}")
    public ResponseEntity<Response<HotelBookingResponse>> bookTicket(
            @PathVariable String category,
            @PathVariable String service,
            @RequestBody HotelBookingRequest request) {

        log.info("🎫 Booking request: category={}, service={}", category, service);

        try {
            BookingProvider provider = bookingProviderFactory.getProvider(category, service);
            Response<HotelBookingResponse> response = provider.bookTicket(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error booking ticket: category={}, service={}", category, service, e);
            Response<HotelBookingResponse> response = ResponseHandler.failure("Booking failed: " + e.getMessage());
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

    /**
     * UNIFIED BOOKING
     * POST /api/booking/unified
     * Books multiple services (EVENT, BUS, HOTEL) in a single transaction
     */
    @PostMapping("/unified")
    public ResponseEntity<Response<com.ticketkatum.model.UnifiedBookingResponse>> unifiedBooking(
            @RequestBody com.ticketkatum.model.CompositeBookingRequest request) {

        log.info("🔗 Unified Booking Request for Customer: {}", request.getCustomerId());

        try {
            com.ticketkatum.model.UnifiedBookingResponse result = bookingOrchestrator.processUnifiedBooking(request);

            if ("SUCCESS".equals(result.getStatus())) {
                return ResponseEntity.ok(ResponseHandler.success("Unified booking completed successfully", result));
            } else {
                Response<com.ticketkatum.model.UnifiedBookingResponse> response = ResponseHandler
                        .failure(result.getMessage());
                response.setData(result);
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
            }
        } catch (Exception e) {
            log.error("❌ Unified booking failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseHandler.failure("Unified booking failed: " + e.getMessage()));
        }
    }
}