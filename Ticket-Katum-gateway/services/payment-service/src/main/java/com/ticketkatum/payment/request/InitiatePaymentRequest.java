package com.ticketkatum.payment.request;

import com.ticketkatum.utils.Request;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class InitiatePaymentRequest extends Request {
    private String successUrl;
    private String failureUrl;
    private String customerEmail;
    private String customerName;
}