package com.ticketkatum.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    // Universal fields mapped to target service expectations (HotelBookingRequest)
    private String hotelId; // Maps to itemReferenceId for Hotel
    private String hotelName;
    private String roomType; // Maps to subReferenceId
    private Integer numberOfRooms;
    
    // For Bus/Event we might overload these or the target service ignores extra fields
    // Assuming the BookingService reuses this class for everything
    
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private List<GuestDetails> guests;
    private ContactDetails contactDetails;
    private PaymentDetails paymentDetails;
    private String specialRequests;
}
