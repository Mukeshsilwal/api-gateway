package com.ticketkatum.dto.market;

import com.ticketkatum.dto.payment.request.PaymentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletePurchaseRequest {
    private java.util.UUID listingId;
    private PurchaseRequest purchaseDetails;
    private PaymentRequest paymentDetails;
}
