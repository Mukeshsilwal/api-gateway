package com.ticketkatum.dto.booking.response;

import com.ticketkatum.dto.hotel.response.BookingResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingResponse {
    private BookingResponse bookingData;
    private PaymentResponse paymentData;
    private HotelDTO hotelDetails;
    private List<RoomDTO> bookedRooms;
    private java.math.BigDecimal totalAmount;
    private String confirmationEmail;
    private String confirmationSms;
}