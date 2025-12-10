package com.ticketkatum.dto;

import com.ticketkatum.dto.auth.ActiveSessionsResponse;
import com.ticketkatum.dto.auth.UserDto;
import com.ticketkatum.dto.auth.UserStatistics;
import com.ticketkatum.dto.booking.BookingSummary;
import com.ticketkatum.dto.payment.PaymentHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedUserDashboard {
    private UserDto user;
    private List<BookingSummary> recentBookings;
    private List<BookingSummary> upcomingBookings;
    private List<ActiveSessionsResponse.SessionInfo> activeSessions;
    private UserStatistics statistics;
    private List<PaymentHistory> paymentHistory;

}