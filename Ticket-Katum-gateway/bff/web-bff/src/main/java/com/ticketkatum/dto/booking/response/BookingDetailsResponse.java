package com.ticketkatum.dto.booking.response;

import com.ticketkatum.dto.booking.BookingSummary;
import com.ticketkatum.dto.payment.PaymentHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailsResponse {
    private BookingSummary bookingInfo;
    private HotelDTO hotel;
    private List<RoomDTO> rooms;
    private PaymentHistory paymentInfo;
    private List<String> amenities;
    private String cancellationPolicy;
    private boolean canCancel;
    private boolean canModify;
}