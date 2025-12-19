package com.ticketkatum.model;


import com.ticketkatum.utils.Request;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelBookingRequest extends Request {
    private String hotelId;
    private String hotelName;
    private String roomType;
    private Integer numberOfRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private List<GuestDetails> guests;
    private ContactDetails contactDetails;
    private PaymentDetails paymentDetails;
    private String specialRequests;
}