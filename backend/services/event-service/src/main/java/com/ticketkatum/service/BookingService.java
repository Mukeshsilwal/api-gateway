package com.ticketkatum.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.WriterException;
import com.ticketkatum.entity.*;
import com.ticketkatum.repository.*;
import com.ticketkatum.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Booking Service
 * Handles event ticket bookings
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final AttendeeRepository attendeeRepository;
    private final QRCodeGenerator qrCodeGenerator;
    private final ObjectMapper objectMapper;

    /**
     * Book event tickets
     */
    @Transactional
    public EventBooking bookTickets(Map<String, Object> bookingData) throws WriterException, IOException {
        log.info("Processing ticket booking");

        Long eventId = ((Number) bookingData.get("eventId")).longValue();
        Long userId = ((Number) bookingData.get("userId")).longValue();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() != Event.EventStatus.PUBLISHED) {
            throw new RuntimeException("Event is not available for booking");
        }

        // Extract ticket selections
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ticketSelections = (List<Map<String, Object>>) bookingData.get("tickets");

        // Validate and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<TicketType> selectedTickets = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();

        for (Map<String, Object> selection : ticketSelections) {
            Long ticketTypeId = ((Number) selection.get("ticketTypeId")).longValue();
            Integer quantity = ((Number) selection.get("quantity")).intValue();

            TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                    .orElseThrow(() -> new RuntimeException("Ticket type not found"));

            if (!ticketType.isAvailable()) {
                throw new RuntimeException("Ticket type not available: " + ticketType.getName());
            }

            if (ticketType.getAvailableQuantity() < quantity) {
                throw new RuntimeException("Not enough tickets available for: " + ticketType.getName());
            }

            selectedTickets.add(ticketType);
            quantities.add(quantity);
            totalAmount = totalAmount.add(ticketType.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        // Calculate fees
        BigDecimal platformFee = totalAmount.multiply(BigDecimal.valueOf(0.05)); // 5%
        BigDecimal tax = totalAmount.multiply(BigDecimal.valueOf(0.13)); // 13% VAT
        BigDecimal grandTotal = totalAmount.add(platformFee).add(tax);

        // Generate booking reference
        String bookingReference = "BKG-" + UUID.randomUUID().toString().substring(0, 13).toUpperCase();

        // Create booking
        EventBooking booking = EventBooking.builder()
                .event(event)
                .userId(userId)
                .bookingReference(bookingReference)
                .totalAmount(totalAmount)
                .platformFee(platformFee)
                .tax(tax)
                .grandTotal(grandTotal)
                .paymentStatus(EventBooking.PaymentStatus.PENDING)
                .status(EventBooking.BookingStatus.PENDING)
                .contactEmail((String) bookingData.get("contactEmail"))
                .contactPhone((String) bookingData.get("contactPhone"))
                .bookedAt(LocalDateTime.now())
                .tickets(objectMapper.writeValueAsString(ticketSelections)) // Serialize tickets to JSON
                .build();

        EventBooking savedBooking = bookingRepository.save(booking);

        // Create attendees and generate QR codes
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> attendeesData = (List<Map<String, Object>>) bookingData.get("attendees");

        List<String> qrCodes = new ArrayList<>();
        int attendeeIndex = 0;

        for (int i = 0; i < selectedTickets.size(); i++) {
            TicketType ticketType = selectedTickets.get(i);
            Integer quantity = quantities.get(i);

            for (int j = 0; j < quantity; j++) {
                Map<String, Object> attendeeData = attendeesData.get(attendeeIndex++);

                String ticketId = qrCodeGenerator.generateTicketId();
                String qrData = qrCodeGenerator.generateTicketQRData(
                        ticketId,
                        eventId.toString(),
                        attendeeData.get("firstName") + " " + attendeeData.get("lastName"));
                String qrCodeBase64 = qrCodeGenerator.generateQRCodeBase64(qrData);

                Attendee attendee = Attendee.builder()
                        .booking(savedBooking)
                        .ticketType(ticketType)
                        .firstName((String) attendeeData.get("firstName"))
                        .lastName((String) attendeeData.get("lastName"))
                        .email((String) attendeeData.get("email"))
                        .phone((String) attendeeData.get("phone"))
                        .qrCode(qrCodeBase64)
                        .ticketId(ticketId)
                        .checkInStatus(Attendee.CheckInStatus.PENDING)
                        .build();

                attendeeRepository.save(attendee);
                qrCodes.add(qrCodeBase64);

                // Update ticket sold count
                ticketType.setQuantitySold(ticketType.getQuantitySold() + 1);
                ticketTypeRepository.save(ticketType);
            }
        }

        // Store QR codes in booking
        savedBooking.setQrCodes(objectMapper.writeValueAsString(qrCodes));
        bookingRepository.save(savedBooking);

        // Update event statistics
        event.setTicketsSold(event.getTicketsSold() + attendeeIndex);
        event.setRevenue(event.getRevenue().add(grandTotal));
        eventRepository.save(event);

        log.info("Booking created: {}", bookingReference);
        return savedBooking;
    }

    /**
     * Get booking by reference
     */
    public EventBooking getBooking(String bookingReference) {
        log.info("Fetching booking: {}", bookingReference);
        return bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    /**
     * Confirm booking payment
     */
    @Transactional
    public EventBooking confirmPayment(String bookingReference, String paymentId) {
        log.info("Confirming payment for booking: {}", bookingReference);

        EventBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setPaymentStatus(EventBooking.PaymentStatus.PAID);
        booking.setPaymentId(paymentId);
        booking.setStatus(EventBooking.BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Cancel booking
     */
    @Transactional
    public EventBooking cancelBooking(String bookingReference, String reason) {
        log.info("Cancelling booking: {}", bookingReference);

        EventBooking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == EventBooking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        booking.setStatus(EventBooking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason);

        // Release tickets
        List<Attendee> attendees = attendeeRepository.findByBookingId(booking.getId());
        for (Attendee attendee : attendees) {
            TicketType ticketType = attendee.getTicketType();
            ticketType.setQuantitySold(ticketType.getQuantitySold() - 1);
            ticketTypeRepository.save(ticketType);

            attendee.setCheckInStatus(Attendee.CheckInStatus.CANCELLED);
            attendeeRepository.save(attendee);
        }

        return bookingRepository.save(booking);
    }

    /**
     * Confirm booking (called by payment verification listener).
     * Wrapper for confirmPayment with transaction IDs.
     */
    @Transactional
    public EventBooking confirmBooking(String bookingReference, String transactionId, String externalTransactionId) {
        log.info("💳 Confirming booking from payment verification: {}, txnId: {}",
                bookingReference, transactionId);

        // Use transactionId as paymentId
        return confirmPayment(bookingReference, transactionId);
    }
}
