package com.ticketkatum.service.serviceimpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.model.PaymentData;
import com.ticketkatum.service.PaymentService;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    public PaymentData decodePaymentSignature(String base64EncodedSignature) {
        try {
            String decodedSignature = decodeBase64(base64EncodedSignature);
            return new ObjectMapper().readValue(decodedSignature, PaymentData.class);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid Base64-encoded string: {}", e.getMessage());
            throw new RuntimeException("Invalid Base64-encoded string", e);
        } catch (Exception e) {
            logger.error("Error decoding payment signature: {}", e.getMessage());
            throw new RuntimeException("Error decoding payment signature", e);
        }
    }

    private String decodeBase64(String encoded) {
        byte[] decodedBytes = Base64.decodeBase64(encoded);
        return new String(decodedBytes, StandardCharsets.UTF_8);
    }
}

