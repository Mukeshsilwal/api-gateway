package com.ticketkatum.events;

import com.ticketkatum.events.booking.BookingConfirmedEvent;
import com.ticketkatum.events.booking.BookingInitiatedEvent;
import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Publisher for booking-related events.
 * Handles publishing of booking lifecycle events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish booking initiated event.
     * This is published when a customer starts the booking process.
     * 
     * @param bookingId        Unique booking identifier
     * @param customerId       Customer ID
     * @param customerEmail    Customer email
     * @param eventId          Event ID
     * @param eventName        Event name
     * @param ticketSelections List of ticket selections
     * @param totalAmount      Total booking amount
     * @param taxAmount        Tax amount
     * @param discountAmount   Discount amount
     * @param promoCode        Promo code used (if any)
     * @param status           Booking status (INITIATED, PENDING_PAYMENT)
     * @param sessionId        Session ID for tracking
     * @param expiryMinutes    How long the booking is held
     */
    public void publishBookingInitiated(
            String bookingId,
            Long customerId,
            String customerEmail,
            Long eventId,
            String eventName,
            List<TicketSelectionDto> ticketSelections,
            BigDecimal totalAmount,
            BigDecimal taxAmount,
            BigDecimal discountAmount,
            String promoCode,
            String status,
            String sessionId,
            Integer expiryMinutes) {

        log.info("Publishing booking initiated event for bookingId: {}, customerId: {}",
                bookingId, customerId);

        List<BookingInitiatedEvent.TicketSelection> selections = ticketSelections.stream()
                .map(dto -> BookingInitiatedEvent.TicketSelection.builder()
                        .ticketTypeId(dto.getTicketTypeId())
                        .ticketTypeName(dto.getTicketTypeName())
                        .quantity(dto.getQuantity())
                        .unitPrice(dto.getUnitPrice())
                        .subtotal(dto.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        BookingInitiatedEvent.BookingInitiatedPayload payload = BookingInitiatedEvent.BookingInitiatedPayload.builder()
                .bookingId(bookingId)
                .customerId(customerId)
                .customerEmail(customerEmail)
                .eventId(eventId)
                .eventName(eventName)
                .ticketSelections(selections)
                .totalAmount(totalAmount)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .promoCode(promoCode)
                .status(status)
                .initiatedAt(Instant.now())
                .sessionId(sessionId)
                .expiryMinutes(expiryMinutes != null ? expiryMinutes : 15)
                .build();

        BookingInitiatedEvent event = new BookingInitiatedEvent(payload);
        event.setCausedBy("booking-service");

        // Use customerId as partition key for ordering per customer
        eventPublisher.publishEvent(event, customerId.toString());

        log.info("Booking initiated event published: eventId={}, bookingId={}",
                event.getEventId(), bookingId);
    }

    /**
     * Publish booking confirmed event.
     * This is published when a booking is confirmed after successful payment.
     * 
     * @param bookingId          Unique booking identifier
     * @param customerId         Customer ID
     * @param customerEmail      Customer email
     * @param customerName       Customer name
     * @param eventId            Event ID
     * @param eventName          Event name
     * @param tickets            List of ticket information
     * @param qrCodes            List of QR codes
     * @param confirmationNumber Confirmation number
     * @param totalAmount        Total amount paid
     * @param paymentId          Payment ID
     * @param ticketDownloadUrl  URL to download tickets
     */
    public void publishBookingConfirmed(
            String bookingId,
            Long customerId,
            String customerEmail,
            String customerName,
            Long eventId,
            String eventName,
            List<TicketInfoDto> tickets,
            List<String> qrCodes,
            String confirmationNumber,
            BigDecimal totalAmount,
            String paymentId,
            String ticketDownloadUrl) {

        log.info("Publishing booking confirmed event for bookingId: {}, customerId: {}",
                bookingId, customerId);

        List<BookingConfirmedEvent.TicketInfo> ticketInfos = tickets.stream()
                .map(dto -> BookingConfirmedEvent.TicketInfo.builder()
                        .ticketId(dto.getTicketId())
                        .ticketTypeName(dto.getTicketTypeName())
                        .qrCode(dto.getQrCode())
                        .seatNumber(dto.getSeatNumber())
                        .section(dto.getSection())
                        .build())
                .collect(Collectors.toList());

        BookingConfirmedEvent.BookingConfirmedPayload payload = BookingConfirmedEvent.BookingConfirmedPayload.builder()
                .bookingId(bookingId)
                .customerId(customerId)
                .customerEmail(customerEmail)
                .customerName(customerName)
                .eventId(eventId)
                .eventName(eventName)
                .tickets(ticketInfos)
                .qrCodes(qrCodes)
                .confirmationNumber(confirmationNumber)
                .totalAmount(totalAmount)
                .paymentId(paymentId)
                .confirmedAt(Instant.now())
                .ticketDownloadUrl(ticketDownloadUrl)
                .build();

        BookingConfirmedEvent event = new BookingConfirmedEvent(payload);
        event.setCausedBy("booking-service");

        // Use customerId as partition key for ordering per customer
        eventPublisher.publishEvent(event, customerId.toString());

        log.info("Booking confirmed event published: eventId={}, bookingId={}, confirmationNumber={}",
                event.getEventId(), bookingId, confirmationNumber);
    }

    /**
     * DTO for ticket selection information
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TicketSelectionDto {
        private Long ticketTypeId;
        private String ticketTypeName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    /**
     * DTO for ticket information
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TicketInfoDto {
        private String ticketId;
        private String ticketTypeName;
        private String qrCode;
        private String seatNumber;
        private String section;
    }
}
