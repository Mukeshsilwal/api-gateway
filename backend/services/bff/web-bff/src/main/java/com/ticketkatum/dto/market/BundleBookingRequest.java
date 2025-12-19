package com.ticketkatum.dto.market;

import lombok.Data;
import java.util.UUID;

@Data
public class BundleBookingRequest {
    private UUID userId;
    private ContactDetails contactDetails;
    private PaymentDetails paymentDetails;
}
