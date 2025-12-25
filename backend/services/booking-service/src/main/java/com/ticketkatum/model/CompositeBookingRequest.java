package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CompositeBookingRequest {
    private String customerId; // Top level customer ID for the transaction
    private Long tripId; // Optional: Trip ID to associate bookings with
    private List<BookingRequestItem> bookings;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BookingRequestItem {
        private String type; // EVENT, BUS, HOTEL
        private Map<String, Object> payload;
    }
}
