package com.ticketkatum.dto.booking.response;

import com.ticketkatum.dto.hotel.HotelDTO;
import com.ticketkatum.dto.hotel.RoomDTO;
import com.ticketkatum.dto.hotel.response.BookingResponse;
import com.ticketkatum.dto.payment.response.PaymentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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