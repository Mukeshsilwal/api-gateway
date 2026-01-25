package com.ticketkatum.market.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.UUID;

@FeignClient(name = "booking-service", contextId = "booking-service-client-travel")
public interface BookingServiceClient {

    @GetMapping("/api/bookings/ticket/{ticketId}/validate-ownership")
    boolean validateTicketOwnership(@PathVariable("ticketId") Long ticketId, @RequestParam("userId") long userId);

    @GetMapping("/api/bookings/ticket/{ticketId}/face-value")
    BigDecimal getTicketFaceValue(@PathVariable("ticketId") Long ticketId);

    @PostMapping("/api/bookings/ticket/{ticketId}/lock-for-resale")
    void lockTicketForResale(@PathVariable("ticketId") Long ticketId);

    @PostMapping("/api/bookings/ticket/{ticketId}/transfer")
    void transferTicket(@PathVariable("ticketId") Long ticketId, @RequestParam("newOwnerId") long newOwnerId);

    @PostMapping("/api/booking/{category}/{service}")
    com.ticketkatum.utils.Response bookTicket(
            @PathVariable("category") String category,
            @PathVariable("service") String service,
            @org.springframework.web.bind.annotation.RequestBody com.ticketkatum.market.dto.BookingRequest request
    );

    @PostMapping("/api/booking/{category}/{service}/cancel")
    com.ticketkatum.utils.Response cancelBooking(
            @PathVariable("category") String category,
            @PathVariable("service") String service,
            @org.springframework.web.bind.annotation.RequestBody com.ticketkatum.market.dto.BookingRequest request
    );
}
