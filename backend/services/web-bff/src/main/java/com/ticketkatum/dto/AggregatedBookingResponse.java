package com.ticketkatum.dto;

import com.ticketkatum.dto.hotel.EnrichedRoomDTO;
import com.ticketkatum.dto.hotel.response.HotelAvailabilityResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedBookingResponse {
    private String bookingReference;
    private Long hotelId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String paymentUrl;
    private String transactionId;
    private HotelAvailabilityResponse availability;
}