package com.ticketkatum.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatistics {
    private Integer totalBookings;
    private Integer completedBookings;
    private Integer cancelledBookings;
    private Integer upcomingBookings;
    private java.math.BigDecimal totalSpent;
    private java.math.BigDecimal averageBookingValue;
    private Integer loyaltyPoints;
}