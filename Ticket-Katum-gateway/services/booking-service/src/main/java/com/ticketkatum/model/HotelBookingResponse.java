package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketkatum.enums.BookingStatus;
import com.ticketkatum.utils.Response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class HotelBookingResponse extends Response<HotelBookingResponse> {
    private String bookingId;
    private String confirmationNumber;
    private String hotelName;
    private String roomType;
    private Integer numberOfRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal totalAmount;
    private String txnId;
    private String currency;
    private LocalDateTime bookingDateTime;
    private BookingStatus bookingStatus;
    private String message;
}