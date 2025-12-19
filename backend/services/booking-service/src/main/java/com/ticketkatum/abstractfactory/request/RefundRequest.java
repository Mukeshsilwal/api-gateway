package com.ticketkatum.abstractfactory.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundRequest {
    private String bookingId;
    private Double amount;
}
