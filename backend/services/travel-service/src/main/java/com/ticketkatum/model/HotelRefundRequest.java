package com.ticketkatum.model;

import com.ticketkatum.utils.Request;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)  // ← Add this

@AllArgsConstructor
public class HotelRefundRequest extends Request {
    private String bookingId;
    private String confirmationNumber;
    private String refundMethod;
    private String bankAccountNumber;
    private String bankName;
}