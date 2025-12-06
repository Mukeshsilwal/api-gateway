package com.ticketkatum.dto;

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
public class UserDashboardResponse {
    private String userId;
    private List<BookingResponse> recentBookings;
    private List<PaymentResponse> recentPayments;
    private List<HotelRecommendation> recommendations;
    private Integer totalBookings;
    private Integer upcomingBookings;
    private Double totalSpent;
    private LocalDateTime timestamp;
}
