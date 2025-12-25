package com.ticketkatum.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import com.ticketkatum.common.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * QR Code Generator Utility
 * Generates QR codes for tickets
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QRCodeGenerator {

    private final SystemConfigService systemConfigService;

    /**
     * Generate unique ticket ID
     */
    public String generateTicketId() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 13).toUpperCase();
    }

    /**
     * Generate QR code as Base64 string
     */
    public String generateQRCodeBase64(String data) throws WriterException, IOException {
        int width = systemConfigService.getInt("QR_WIDTH", 300);
        int height = systemConfigService.getInt("QR_HEIGHT", 300);
        return generateQRCodeBase64(data, width, height);
    }

    /**
     * Generate QR code with custom dimensions
     */
    public String generateQRCodeBase64(String data, int width, int height)
            throws WriterException, IOException {

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        byte[] qrCodeBytes = outputStream.toByteArray();
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(qrCodeBytes);
    }

    /**
     * Generate QR code data for ticket
     */
    public String generateTicketQRData(String ticketId, String eventId, String attendeeName) {
        return String.format("TICKET:%s|EVENT:%s|NAME:%s", ticketId, eventId, attendeeName);
    }
}
