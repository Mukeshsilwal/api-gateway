package com.ticketkatum.controller;

import com.ticketkatum.model.PaymentData;
import com.ticketkatum.utils.Response;
import com.ticketkatum.model.ResponseHandler;
import com.ticketkatum.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentEsewaController {

    private final com.ticketkatum.client.BookingClient bookingClient;
    private final com.ticketkatum.configs.EsewaProperties esewaProperties;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final PaymentService paymentService;

    @GetMapping(value = "/esewa/{bookingId}", produces = MediaType.TEXT_HTML_VALUE)
    public String redirectToEsewa(@PathVariable String bookingId) {
        log.info("💳 Initiating eSewa payment for booking: {}", bookingId);

        // 1. Get booking details from Booking Service
        Response response = bookingClient.getBookingDetails(bookingId);

        if (response == null || response.getData() == null) {
            return "<html><body><h1>Error: Booking not found</h1></body></html>";
        }

        // 2. Parse details
        // The data is likely a LinkedHashMap because of Feign/Jackson default decoding
        try {
            java.util.Map<String, Object> booking = objectMapper.convertValue(response.getData(), java.util.Map.class);

            Object amountObj = booking.get("totalAmount"); // Ensure this matches what getGenericBookingDetails or
                                                           // service specific returns
            // Note: EventBookingProvider returns "totalAmount"
            // GenericHotelService returns "totalAmount" in JSON response

            if (amountObj == null)
                throw new RuntimeException("Invalid booking amount");

            String totalAmount = String.valueOf(amountObj);

            // 3. Generate HTML form
            return """
                    <html>
                      <body onload="document.forms[0].submit()">
                        <form action="%s" method="POST">
                          <input type="hidden" name="amt" value="%s"/>
                          <input type="hidden" name="psc" value="0"/>
                          <input type="hidden" name="pdc" value="0"/>
                          <input type="hidden" name="tAmt" value="%s"/>
                          <input type="hidden" name="pid" value="%s"/>
                          <input type="hidden" name="scd" value="%s"/>
                          <input type="hidden" name="su" value="%s"/>
                          <input type="hidden" name="fu" value="%s"/>
                        </form>
                      </body>
                    </html>
                    """.formatted(
                    esewaProperties.getBaseUrl(),
                    totalAmount,
                    totalAmount,
                    bookingId,
                    esewaProperties.getMerchantCode(),
                    esewaProperties.getSuccessUrl(),
                    esewaProperties.getFailureUrl());

        } catch (Exception e) {
            log.error("Failed to generate eSewa form", e);
            return "<html><body><h1>Error processing payment request: " + e.getMessage() + "</h1></body></html>";
        }
    }

    @PostMapping("/decode")
    public Response decodePaymentSignature(@RequestParam String paymentRequest) {
        try {
            log.info("🔐 Decoding eSewa payment signature...");

            PaymentData paymentData = paymentService.decodePaymentSignature(paymentRequest);

            return ResponseHandler.success(
                    "Payment signature decoded successfully",
                    paymentData);

        } catch (Exception e) {
            log.error("❌ Failed to decode eSewa signature: {}", e.getMessage());
            return ResponseHandler.failure("Invalid payment signature");
        }
    }
}
