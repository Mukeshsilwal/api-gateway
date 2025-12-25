package com.ticketkatum.abstractfactory.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import com.ticketkatum.entity.Booking;
import com.ticketkatum.repository.BookingRepo;

/**
 * Event Booking Provider
 * Handles event ticket bookings by communicating with event-service
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EventBookingProvider implements BookingProvider<Request> {

    @Autowired
    private RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final BookingRepo bookingRepo;

    @Value("${services.event-service.url:http://localhost:8085}")
    private String eventServiceUrl;

    @Override
    public String getType() {
        return "EVENT";
    }

    @Override
    public Response bookTicket(Request request) {
        log.info("🎫 Processing EVENT booking for customer: {}", request.getCustomerId());

        try {
            // Build booking request for event-service
            Map<String, Object> bookingData = buildBookingRequest(request);
            Map<String, Object> metadata = request.getMetadata() != null ? request.getMetadata() : new HashMap<>();

            // Call event-service booking endpoint
            String url = eventServiceUrl + "/api/bookings/event";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(bookingData, headers);

            log.info("📡 Calling event-service: POST {}", url);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                // Extract booking details from event-service response
                @SuppressWarnings("unchecked")
                Map<String, Object> bookingDetails = (Map<String, Object>) responseBody.get("data");

                if (bookingDetails != null) {
                    String bookingReference = (String) bookingDetails.get("bookingReference");
                    BigDecimal grandTotal = extractBigDecimal(bookingDetails.get("grandTotal"));

                    log.info("✅ EVENT booking successful - Reference: {}, Amount: NPR {}",
                            bookingReference, grandTotal);

                    // Build standardized response
                    Map<String, Object> result = new HashMap<>();
                    result.put("bookingId", bookingDetails.get("id"));
                    result.put("confirmationNumber", bookingReference);
                    result.put("totalAmount", grandTotal);
                    result.put("bookingReference", bookingReference);
                    result.put("paymentStatus", bookingDetails.get("paymentStatus"));
                    result.put("status", bookingDetails.get("status"));
                    result.put("eventId", metadata.get("eventId"));
                    result.put("customerId", request.getCustomerId());

                    Response<Map<String, Object>> successResponse = ResponseHandler.success(
                            "Event booking created successfully", result);
                    successResponse.setStatusCode(200);

                    // Sync to central Booking table
                    try {
                        Booking booking = new Booking();
                        booking.setCustomerId(request.getCustomerId());
                        booking.setCategory("EVENT");
                        booking.setProviderName("EVENT_SERVICE");
                        booking.setAmount(grandTotal.doubleValue());
                        booking.setStatus("PENDING");
                        booking.setProviderBookingId(bookingReference);
                        booking.setCreatedAt(LocalDateTime.now());
                        bookingRepo.save(booking);
                    } catch (Exception ex) {
                        log.error("Failed to sync event booking to central table", ex);
                        // Continue, don't fail the request
                    }

                    return successResponse;
                }
            }

            log.error("❌ EVENT booking failed - Invalid response from event-service");
            return ResponseHandler.failure("Failed to create event booking");

        } catch (HttpClientErrorException e) {
            log.error("❌ EVENT booking failed - HTTP error: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseHandler.failure("Event booking failed: " + extractErrorMessage(e));
        } catch (Exception e) {
            log.error("❌ EVENT booking failed - Unexpected error", e);
            return ResponseHandler.failure("Event booking failed: " + e.getMessage());
        }
    }

    @Override
    public Response cancel(Request request) {
        log.info("🚫 Processing EVENT cancellation for customer: {}", request.getCustomerId());

        try {
            Map<String, Object> metadata = request.getMetadata() != null ? request.getMetadata() : new HashMap<>();
            String bookingReference = (String) metadata.get("bookingReference");
            if (bookingReference == null || bookingReference.isEmpty()) {
                return ResponseHandler.failure("Booking reference is required for cancellation");
            }

            // Build cancellation request
            Map<String, String> cancelData = new HashMap<>();
            cancelData.put("reason", "Customer requested cancellation via unified booking");

            String url = eventServiceUrl + "/api/bookings/event/" + bookingReference + "/cancel";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(cancelData, headers);

            log.info("📡 Calling event-service: POST {}", url);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("✅ EVENT cancellation successful - Reference: {}", bookingReference);
                return ResponseHandler.success("Event booking cancelled successfully");
            }

            log.error("❌ EVENT cancellation failed");
            return ResponseHandler.failure("Failed to cancel event booking");

        } catch (HttpClientErrorException e) {
            log.error("❌ EVENT cancellation failed - HTTP error: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseHandler.failure("Event cancellation failed: " + extractErrorMessage(e));
        } catch (Exception e) {
            log.error("❌ EVENT cancellation failed - Unexpected error", e);
            return ResponseHandler.failure("Event cancellation failed: " + e.getMessage());
        }
    }

    @Override
    public Response refund(Request request) {
        log.info("💰 Processing EVENT refund for customer: {}", request.getCustomerId());

        try {
            // For now, refund is handled through cancellation
            // In a real system, you'd have a separate refund endpoint
            Map<String, Object> metadata = request.getMetadata() != null ? request.getMetadata() : new HashMap<>();
            String bookingReference = (String) metadata.get("bookingReference");
            if (bookingReference == null || bookingReference.isEmpty()) {
                return ResponseHandler.failure("Booking reference is required for refund");
            }

            log.info("ℹ️ EVENT refund processed via cancellation for: {}", bookingReference);
            return cancel(request);

        } catch (Exception e) {
            log.error("❌ EVENT refund failed", e);
            return ResponseHandler.failure("Event refund failed: " + e.getMessage());
        }
    }

    @Override
    public String getBooking(String bookingId) {
        log.info("📋 Fetching EVENT booking: {}", bookingId);

        try {
            String url = eventServiceUrl + "/api/bookings/event/" + bookingId;

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.writeValueAsString(response.getBody());
            }

            return "{}";

        } catch (Exception e) {
            log.error("❌ Failed to fetch EVENT booking: {}", bookingId, e);
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }

    @Override
    public void confirmBooking(String bookingId, String transactionId) {
        log.info("💳 Confirming EVENT payment: bookingId={}, txnId={}", bookingId, transactionId);

        try {
            String url = eventServiceUrl + "/api/bookings/event/" + bookingId + "/confirm";

            Map<String, String> paymentData = new HashMap<>();
            paymentData.put("paymentId", transactionId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(paymentData, headers);

            restTemplate.postForEntity(url, httpEntity, Map.class);
            log.info("✅ EVENT payment confirmed successfully for {}", bookingId);

            // Sync confirmation to central Booking table
            try {
                bookingRepo.findByProviderBookingId(bookingId).ifPresent(booking -> {
                    booking.setStatus("CONFIRMED");
                    booking.setProviderTransactionId(transactionId);
                    bookingRepo.save(booking);
                });
            } catch (Exception ex) {
                log.error("Failed to sync event confirmation to central table", ex);
            }

        } catch (Exception e) {
            log.error("❌ Failed to confirm EVENT payment for {}", bookingId, e);
            throw new RuntimeException("Failed to confirm event booking: " + e.getMessage());
        }
    }

    /**
     * Build booking request for event-service
     */
    private Map<String, Object> buildBookingRequest(Request request) {
        Map<String, Object> bookingData = new HashMap<>();
        Map<String, Object> metadata = request.getMetadata() != null ? request.getMetadata() : new HashMap<>();

        // Required fields
        bookingData.put("eventId", metadata.get("eventId"));
        bookingData.put("userId", request.getCustomerId());
        bookingData.put("contactEmail", metadata.getOrDefault("email", "customer@example.com"));
        bookingData.put("contactPhone", metadata.getOrDefault("phone", "9800000000"));

        // Ticket selections
        List<Map<String, Object>> tickets = new ArrayList<>();
        if (metadata.containsKey("ticketTypeId") && metadata.containsKey("quantity")) {
            Map<String, Object> ticket = new HashMap<>();
            ticket.put("ticketTypeId", metadata.get("ticketTypeId"));
            ticket.put("quantity", metadata.get("quantity"));
            tickets.add(ticket);
        } else if (metadata.containsKey("tickets")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ticketsList = (List<Map<String, Object>>) metadata.get("tickets");
            tickets = ticketsList;
        }
        bookingData.put("tickets", tickets);

        // Attendees - generate default attendees if not provided
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> attendees = (List<Map<String, Object>>) metadata.get("attendees");
        if (attendees == null || attendees.isEmpty()) {
            attendees = generateDefaultAttendees(request);
        }
        bookingData.put("attendees", attendees);

        return bookingData;
    }

    /**
     * Generate default attendees when not provided
     */
    private List<Map<String, Object>> generateDefaultAttendees(Request request) {
        List<Map<String, Object>> attendees = new ArrayList<>();
        Map<String, Object> metadata = request.getMetadata() != null ? request.getMetadata() : new HashMap<>();

        int totalTickets = 1;
        if (metadata.containsKey("quantity")) {
            totalTickets = ((Number) metadata.get("quantity")).intValue();
        }

        String email = (String) metadata.getOrDefault("email", "guest@example.com");
        String phone = (String) metadata.getOrDefault("phone", "9800000000");

        for (int i = 0; i < totalTickets; i++) {
            Map<String, Object> attendee = new HashMap<>();
            attendee.put("firstName", "Guest");
            attendee.put("lastName", String.valueOf(i + 1));
            attendee.put("email", email);
            attendee.put("phone", phone);
            attendees.add(attendee);
        }

        return attendees;
    }

    /**
     * Extract BigDecimal from various number types
     */
    private BigDecimal extractBigDecimal(Object value) {
        if (value == null)
            return BigDecimal.ZERO;
        if (value instanceof BigDecimal)
            return (BigDecimal) value;
        if (value instanceof Number)
            return new BigDecimal(value.toString());
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Extract error message from HTTP exception
     */
    private String extractErrorMessage(HttpClientErrorException e) {
        try {
            Map<String, Object> errorBody = objectMapper.readValue(
                    e.getResponseBodyAsString(),
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                    });
            return (String) errorBody.getOrDefault("message", e.getMessage());
        } catch (Exception ex) {
            return e.getMessage();
        }
    }
}
