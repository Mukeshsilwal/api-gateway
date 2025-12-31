package com.ticketkatum.payment.request;

import com.ticketkatum.utils.Request;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = false)
@Data
public class VerifyPaymentRequest extends Request {
    private String transactionId;   // internal
    private String providerToken;   // esewa '' or khalti token/pidx
}