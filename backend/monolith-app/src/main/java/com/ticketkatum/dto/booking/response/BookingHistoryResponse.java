package com.ticketkatum.dto.booking.response;

import com.ticketkatum.dto.auth.UserStatistics;
import com.ticketkatum.dto.booking.BookingSummary;
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
    private List<BookingSummary> bookings;
    private Integer totalBookings;
    private Integer totalPages;
    private Integer currentPage;
    private UserStatistics statistics;
}
