package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Advanced Search Criteria DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSearchCriteria {

    private String keyword; // Search in name, description
    private String category;
    private String type; // ONLINE, IN_PERSON, HYBRID
    private String status;

    // Date range
    private LocalDateTime startDateFrom;
    private LocalDateTime startDateTo;

    // Price range
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Location
    private String city;
    private String country;

    // Availability
    private Boolean hasAvailableTickets;

    // Tags
    private List<String> tags;

    // Sorting
    private String sortBy; // date, price, popularity, name
    private String sortOrder; // asc, desc

    // Pagination
    private Integer page = 0;
    private Integer size = 20;
}
