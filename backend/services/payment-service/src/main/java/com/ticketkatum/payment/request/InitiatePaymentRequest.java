package com.ticketkatum.payment.request;

import com.ticketkatum.utils.Request;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class InitiatePaymentRequest extends Request {
    private String bookingId;
    private String successUrl;
    private long hotelId;
    private String failureUrl;
    private String customerEmail;
    private String customerName;
}