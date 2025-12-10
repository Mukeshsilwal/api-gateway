package com.ticketkatum.dto.auth;

import com.ticketkatum.dto.AggregatedUserDashboard;
import com.ticketkatum.dto.booking.response.BookingHistoryResponse;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class CompleteUserProfile {
    private AggregatedUserDashboard dashboard;
    private BookingHistoryResponse recentBookings;
}