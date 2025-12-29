package com.ticketkatum.controller;

import com.ticketkatum.entity.Booking;
import com.ticketkatum.repository.BookingRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class ResaleSupportController {

    private final BookingRepo bookingRepo;

    @GetMapping("/ticket/{ticketId}/validate-ownership")
    public ResponseEntity<Boolean> validateTicketOwnership(@PathVariable Long ticketId, @RequestParam Long userId) {
        // Assuming userId is String in Booking entity based on previous read
        return bookingRepo.findById(ticketId)
                .map(booking -> booking.getCustomerId().equals(userId) && "CONFIRMED".equals(booking.getStatus()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(false));
    }

    @GetMapping("/ticket/{ticketId}/face-value")
    public ResponseEntity<BigDecimal> getTicketFaceValue(@PathVariable Long ticketId) {
        return bookingRepo.findById(ticketId)
                .map(booking -> BigDecimal.valueOf(booking.getAmount()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/ticket/{ticketId}/lock-for-resale")
    public ResponseEntity<Void> lockTicketForResale(@PathVariable Long ticketId) {
        Booking booking = bookingRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("LOCKED_FOR_RESALE");
        bookingRepo.save(booking);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ticket/{ticketId}/transfer")
    public ResponseEntity<Void> transferTicket(@PathVariable Long ticketId, @RequestParam String newOwnerId) {
        Booking booking = bookingRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // In a real system, we might invalidate this and create a new one to generate a
        // new ID
        // For simplicity now, we transfer ownership
        booking.setStatus("TRANSFERRED"); // Mark old as Transferred/Resold
        bookingRepo.save(booking);

        Booking newBooking = new Booking();
        newBooking.setCustomerId(newOwnerId);
        newBooking.setCategory(booking.getCategory());
        newBooking.setProviderName(booking.getProviderName());
        newBooking.setAmount(booking.getAmount());
        newBooking.setStatus("CONFIRMED");
        newBooking.setCreatedAt(java.time.LocalDateTime.now());
        // Copy other fields as needed

        bookingRepo.save(newBooking);

        return ResponseEntity.ok().build();
    }
}
