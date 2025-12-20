package com.ticketkatum.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Organizer Dashboard DTO
 * Aggregates all organizer-related data in one response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerDashboardDto {

    // Organizer profile
    private OrganizerProfile organizer;

    // Events summary
    private EventsSummary events;

    // Financial summary
    private FinancialSummary financial;

    // Recent activity
    private List<RecentBooking> recentBookings;
    private List<Notification> notifications;

    // Analytics
    private Map<String, Object> analytics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerProfile {
        private Long id;
        private String organizationName;
        private String logo;
        private BigDecimal rating;
        private Integer totalEvents;
        private Long totalTicketsSold;
        private String verificationStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventsSummary {
        private Integer total;
        private Integer published;
        private Integer draft;
        private Integer upcoming;
        private Integer past;
        private List<EventCard> upcomingEvents;
        private List<EventCard> draftEvents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventCard {
        private Long id;
        private String name;
        private String slug;
        private String coverImage;
        private String status;
        private Integer ticketsSold;
        private Integer totalTickets;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialSummary {
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private BigDecimal pendingPayout;
        private Integer totalTicketsSold;
        private Integer monthlyTicketsSold;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBooking {
        private String bookingReference;
        private String eventName;
        private String attendeeName;
        private BigDecimal amount;
        private String status;
        private String bookedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notification {
        private Long id;
        private String type;
        private String title;
        private String message;
        private Boolean read;
        private String createdAt;
    }
}
