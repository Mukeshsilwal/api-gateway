package com.ticketkatum.dto.booking.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long hotelId;
    private List<Long> roomIds;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int numberOfGuests;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;
}

