package com.ticketkatum.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.abstractfactory.provider.factory.BookingProviderFactory;
import com.ticketkatum.exception.CompositeBookingException;
import com.ticketkatum.model.CompositeBookingRequest;
import com.ticketkatum.model.UnifiedBookingResponse;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Orchestrator for unified booking operations.
 * Handles multi-service bookings with saga pattern compensation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingOrchestrator {

    private final BookingProviderFactory bookingProviderFactory;
    private final ObjectMapper objectMapper;

    /**
     * Process unified booking across multiple services.
     * Implements saga pattern with compensation on failure.
     *
     * @param compositeRequest Composite booking request
     * @return Unified booking response with all booking details
     */
    @Transactional
    public UnifiedBookingResponse processUnifiedBooking(CompositeBookingRequest compositeRequest) {
        String transactionId = UUID.randomUUID().toString();
        log.info("🔗 [{}] Processing unified booking for customer: {}",
                transactionId, compositeRequest.getCustomerId());

        List<BookingContext> completedBookings = new ArrayList<>();
        List<UnifiedBookingResponse.BookingResult> bookingResults = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        try {
            // Phase 1: Execute all bookings
            for (CompositeBookingRequest.BookingRequestItem item : compositeRequest.getBookings()) {
                String type = item.getType();
                String service = (String) item.getPayload().getOrDefault("provider", "standard");

                log.info("📋 [{}] Processing {} booking with provider: {}", transactionId, type, service);

                BookingProvider provider = bookingProviderFactory.getProvider(type, service);

                // Convert payload map to Request object
                Request request = objectMapper.convertValue(item.getPayload(), Request.class);
                request.setCustomerId(compositeRequest.getCustomerId());

                Response response = provider.bookTicket(request);

                // Validate response
                if (response == null || (response.getStatusCode() != 200 && response.getStatusCode() != 201)) {
                    throw new RuntimeException("Booking failed for " + type + ": "
                            + (response != null ? response.getMessage() : "Unknown error"));
                }

                // Extract booking details from response
                String bookingId = extractBookingId(response);
                String confirmationNumber = extractConfirmationNumber(response);
                BigDecimal bookingAmount = extractAmount(response);

                completedBookings.add(new BookingContext(provider, request, response));

                // Build booking result
                UnifiedBookingResponse.BookingResult result = UnifiedBookingResponse.BookingResult.builder()
                        .type(type)
                        .bookingId(bookingId)
                        .confirmationNumber(confirmationNumber)
                        .status("SUCCESS")
                        .amount(bookingAmount)
                        .message("Booking successful")
                        .details(response.getData())
                        .build();

                bookingResults.add(result);
                totalAmount = totalAmount.add(bookingAmount);

                log.info("✅ [{}] Successfully booked {} - Booking ID: {}, Amount: NPR {}",
                        transactionId, type, bookingId, bookingAmount);
            }

            // Phase 2: All bookings successful
            log.info("🎉 [{}] All bookings completed successfully. Total: {} bookings, Amount: NPR {}",
                    transactionId, bookingResults.size(), totalAmount);

            // Build unified response
            return UnifiedBookingResponse.builder()
                    .transactionId(transactionId)
                    .customerId(compositeRequest.getCustomerId())
                    .bookings(bookingResults)
                    .totalAmount(totalAmount)
                    .status("SUCCESS")
                    .createdAt(Instant.now())
                    .message("All bookings completed successfully")
                    .paymentInfo(UnifiedBookingResponse.PaymentInfo.builder()
                            .paymentStatus("PENDING")
                            .amount(totalAmount)
                            .currency("NPR")
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("❌ [{}] Unified booking failed. Initiating compensation...", transactionId, e);
            compensate(completedBookings, transactionId);

            // Build failure response
            return UnifiedBookingResponse.builder()
                    .transactionId(transactionId)
                    .customerId(compositeRequest.getCustomerId())
                    .bookings(bookingResults)
                    .totalAmount(totalAmount)
                    .status("FAILED")
                    .createdAt(Instant.now())
                    .message("Booking failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Compensate (rollback) completed bookings in reverse order.
     */
    private void compensate(List<BookingContext> bookings, String transactionId) {
        log.warn("🔄 [{}] Starting compensation for {} bookings", transactionId, bookings.size());

        for (int i = bookings.size() - 1; i >= 0; i--) {
            BookingContext context = bookings.get(i);
            try {
                log.info("↩️ [{}] Compensating {} booking", transactionId, context.provider.getType());
                context.provider.cancel(context.request);
                log.info("✅ [{}] Successfully compensated {} booking",
                        transactionId, context.provider.getType());
            } catch (Exception e) {
                log.error("❌ [{}] Failed to compensate {} booking - Manual intervention required",
                        transactionId, context.provider.getType(), e);
            }
        }

        log.warn("🔄 [{}] Compensation completed", transactionId);
    }

    /**
     * Extract booking ID from response.
     */
    private String extractBookingId(Response response) {
        if (response.getData() != null) {
            try {
                if (response.getData() instanceof java.util.Map) {
                    Object id = ((java.util.Map<?, ?>) response.getData()).get("bookingId");
                    if (id != null)
                        return id.toString();
                }
            } catch (Exception e) {
                log.warn("Could not extract bookingId from response", e);
            }
        }
        return UUID.randomUUID().toString();
    }

    /**
     * Extract confirmation number from response.
     */
    private String extractConfirmationNumber(Response response) {
        if (response.getData() != null) {
            try {
                if (response.getData() instanceof java.util.Map) {
                    Object confNum = ((java.util.Map<?, ?>) response.getData()).get("confirmationNumber");
                    if (confNum != null)
                        return confNum.toString();
                }
            } catch (Exception e) {
                log.warn("Could not extract confirmationNumber from response", e);
            }
        }
        return "CONF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Extract amount from response.
     */
    private BigDecimal extractAmount(Response response) {
        if (response.getData() != null) {
            try {
                if (response.getData() instanceof java.util.Map) {
                    Object amount = ((java.util.Map<?, ?>) response.getData()).get("totalAmount");
                    if (amount != null) {
                        if (amount instanceof BigDecimal)
                            return (BigDecimal) amount;
                        if (amount instanceof Number)
                            return new BigDecimal(amount.toString());
                    }
                }
            } catch (Exception e) {
                log.warn("Could not extract amount from response", e);
            }
        }
        return BigDecimal.ZERO;
    }

    /**
     * Context for tracking completed bookings for compensation.
     */
    private record BookingContext(BookingProvider provider, Request request, Response response) {
    }
}
