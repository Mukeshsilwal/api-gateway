package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistoryResponse {
    private String userEmail;
    private List<AggregatedBookingDetails> bookings;
    private int totalBookings;
    private int completedBookings;
    private int cancelledBookings;
}
