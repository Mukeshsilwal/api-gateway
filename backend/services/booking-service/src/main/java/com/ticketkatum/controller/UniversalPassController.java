package com.ticketkatum.controller;

import com.ticketkatum.entity.Booking;
import com.ticketkatum.repository.BookingRepo;
import com.ticketkatum.service.QRService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/pass")
@RequiredArgsConstructor
public class UniversalPassController {

    private final QRService qrService;
    private final BookingRepo bookingRepo;

    /**
     * Get My QR
     * Generates a short-lived JWT for the user to display.
     */
    @GetMapping("/my-qr")
    public ResponseEntity<Map<String, String>> getMyQR(@RequestParam String userId) {
        // In a real app, userId comes from Security Context
        String token = qrService.generatePassToken(userId);
        return ResponseEntity.ok(Map.of("qrToken", token));
    }

    /**
     * Verify QR (Scanner App)
     * context: BUS_STATION, HOTEL_LOBBY, EVENT_GATE
     * locationId: The specific bus/hotel/event ID where the scan is happening.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyQR(
            @RequestBody Map<String, String> request) {

        String token = request.get("qrToken");
        String context = request.get("context"); // e.g., HOTEL
        String locationId = request.get("locationId"); // e.g., property_123

        String userId = qrService.validateTokenAndGetUserId(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("status", "INVALID", "message", "QR Expired or Invalid"));
        }

        // Fetch user's active bookings
        List<Booking> bookings = bookingRepo.findByCustomerId(userId);

        // Filter logic based on Context
        // This is a simplified logic. In prod, we check dates, active status, etc.
        List<Booking> validBookings = bookings.stream()
                .filter(b -> isValidForContext(b, context, locationId))
                .collect(Collectors.toList());

        if (validBookings.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "DENIED",
                    "message", "No active booking found for this location.",
                    "user", userId));
        }

        return ResponseEntity.ok(Map.of(
                "status", "GRANTED",
                "message", "Welcome!",
                "entitlements", validBookings));
    }

    private boolean isValidForContext(Booking booking, String context, String locationId) {
        // Simplified Logic: Just checking if the category matches the context
        // In real life, check if booking.providerId == locationId
        if ("HOTEL_LOBBY".equals(context) && "HOTEL".equals(booking.getCategory())) {
            return true;
        }
        if ("BUS_STATION".equals(context) && "BUS".equals(booking.getCategory())) {
            return true;
        }
        if ("EVENT_GATE".equals(context)
                && "EVENT".equals(booking.getCategory())) {
            // Mapping Cinema/Event to Event Gate
            return true;
        }
        return false;
    }
}
