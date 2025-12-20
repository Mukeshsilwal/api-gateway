package com.ticketkatum.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregated Event DTO
 * Combines event data with organizer and ticket information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AggregatedEventDto {

    // Event basic info
    private Long id;
    private String slug;
    private String name;
    private String category;
    private String type;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String description;
    private String shortDescription;
    private String coverImage;
    private List<String> images;
    private List<String> tags;
    private String status;

    // Venue info
    private VenueInfo venue;
    private String onlineLink;

    // Organizer info (aggregated from organizer data)
    private OrganizerInfo organizer;

    // Ticket info (aggregated from ticket types)
    private List<TicketTypeInfo> ticketTypes;
    private Integer totalTickets;
    private Integer ticketsSold;
    private Integer ticketsAvailable;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Statistics
    private Long views;
    private Integer likes;
    private Integer shares;
    private BigDecimal revenue;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerInfo {
        private Long id;
        private String name;
        private String logo;
        private BigDecimal rating;
        private Integer totalEvents;
        private String verificationStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VenueInfo {
        private Long id;
        private String name;
        private String city;
        private String address;
        private Integer capacity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketTypeInfo {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer quantity;
        private Integer quantitySold;
        private Integer available;
        private Boolean isActive;
        private LocalDateTime availableFrom;
        private LocalDateTime availableTo;
    }
}
