package com.ticketkatum.dto.hotel.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketkatum.enums.BookingStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
public class HotelBookingResponse{
    private String bookingId;
    private String confirmationNumber;
    private String hotelName;
    private String roomType;
    private Integer numberOfRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDateTime bookingDateTime;
    private BookingStatus bookingStatus;
    private String message;
}