package com.ticketkatum.controller;

import com.ticketkatum.model.PaymentData;
import com.ticketkatum.utils.Response;
import com.ticketkatum.model.ResponseHandler;
import com.ticketkatum.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentEsewaController {

    private final PaymentService paymentService;

    @PostMapping("/decode")
    public Response decodePaymentSignature(@RequestParam String paymentRequest) {
        try {
            log.info("🔐 Decoding eSewa payment signature...");

            PaymentData paymentData = paymentService.decodePaymentSignature(paymentRequest);

            return ResponseHandler.success(
                    "Payment signature decoded successfully",
                    paymentData
            );

        } catch (Exception e) {
            log.error("❌ Failed to decode eSewa signature: {}", e.getMessage());
            return ResponseHandler.failure("Invalid payment signature");
        }
    }
}
