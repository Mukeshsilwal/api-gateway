package com.ticketkatum.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregated Booking DTO
 * Combines booking, event, attendee, and payment data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AggregatedBookingDto {

    // Booking info
    private Long id;
    private String bookingReference;
    private String status;
    private String paymentStatus;

    // Event info (minimal)
    private EventSummary event;

    // User info
    private UserInfo user;

    // Attendees with QR codes
    private List<AttendeeInfo> attendees;

    // Pricing
    private BigDecimal totalAmount;
    private BigDecimal platformFee;
    private BigDecimal tax;
    private BigDecimal grandTotal;

    // Payment info
    private String paymentId;
    private String paymentMethod;

    // Timestamps
    private LocalDateTime bookedAt;
    private LocalDateTime confirmedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventSummary {
        private Long id;
        private String name;
        private String slug;
        private LocalDateTime startDateTime;
        private String coverImage;
        private String venueName;
        private String city;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendeeInfo {
        private String ticketId;
        private String firstName;
        private String lastName;
        private String email;
        private String ticketType;
        private BigDecimal price;
        private String qrCode;
        private String checkInStatus;
        private LocalDateTime checkedInAt;
    }
}
