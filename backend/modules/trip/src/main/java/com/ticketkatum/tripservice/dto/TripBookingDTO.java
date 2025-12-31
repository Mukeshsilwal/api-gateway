package com.ticketkatum.tripservice.dto;

import com.ticketkatum.tripservice.entity.TripBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripBookingDTO implements Serializable {

    private Long id;
    private Long tripId;
    private String bookingType;
    private Long bookingId;
    private String bookingReference;
    private LocalDateTime bookingDate;
    private BigDecimal amount;
    private String status;
    private String details;
    private LocalDateTime createdAt;

    public static TripBookingDTO fromEntity(TripBooking booking) {
        if (booking == null) {
            return null;
        }

        return TripBookingDTO.builder()
                .id(booking.getId())
                .tripId(booking.getTrip() != null ? booking.getTrip().getTripId() : null)
                .bookingType(booking.getBookingType().name())
                .bookingId(booking.getBookingId())
                .bookingReference(booking.getBookingReference())
                .bookingDate(booking.getBookingDate())
                .amount(booking.getAmount())
                .status(booking.getStatus().name())
                .details(booking.getDetails())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
