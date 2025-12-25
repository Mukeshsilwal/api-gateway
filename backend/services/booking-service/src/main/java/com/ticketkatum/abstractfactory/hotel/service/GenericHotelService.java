package com.ticketkatum.abstractfactory.hotel.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.config.EsewaProperties;
import com.ticketkatum.entity.HotelBooking;
import com.ticketkatum.entity.HotelConfig;
import com.ticketkatum.enums.BookingStatus;
import com.ticketkatum.jms.HotelEmailService;
import com.ticketkatum.model.HotelBookingRequest;
import com.ticketkatum.model.HotelBookingResponse;
import com.ticketkatum.model.HotelCancellationRequest;
import com.ticketkatum.model.HotelRefundRequest;
import com.ticketkatum.repository.HotelBookingRepo;
import com.ticketkatum.repository.HotelConfigRepository;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Qualifier("hotelGenericProvider")
@Component
public class GenericHotelService implements BookingProvider {

    private final HotelBookingRepo hotelBookingRepo;
    private final HotelConfigRepository hotelConfigRepo;
    private final ObjectMapper mapper;
    private final HotelEmailService emailService;
    private final EsewaProperties esewaProperties;
    private final com.ticketkatum.events.publisher.EventPublisher eventPublisher;

    @Setter
    private String hotelCode;

    @Override
    public String getType() {
        return hotelCode;
    }

    @Override
    @Transactional
    public Response bookTicket(Request request) {

        try {
            HotelBookingRequest req = mapper.convertValue(request, HotelBookingRequest.class);

            validate(req);

            HotelConfig config = hotelConfigRepo.findByHotelName(req.getHotelName())
                    .orElseThrow(() -> new RuntimeException("Hotel configuration not found"));

            if (req.getHotelName() == null)
                req.setHotelName(config.getHotelName());

            BigDecimal totalAmount = calculateDynamicPrice(req, config);

            String bookingId = generateBookingId();
            String confirmation = generateConfirmationNumber();

            String guestJson = mapper.writeValueAsString(req.getGuests());

            HotelBooking booking = HotelBooking.builder()
                    .bookingId(bookingId)
                    .confirmationNumber(confirmation)
                    .hotelId(req.getHotelId())
                    .hotelName(req.getHotelName())
                    .roomType(req.getRoomType())
                    .numberOfRooms(req.getNumberOfRooms())
                    .checkInDate(req.getCheckInDate())
                    .checkOutDate(req.getCheckOutDate())
                    .numberOfGuests(req.getNumberOfGuests())
                    .guestDetailsJson(guestJson)
                    .contactEmail(req.getContactDetails().getEmail())
                    .contactPhone(req.getContactDetails().getPhone())
                    .totalAmount(totalAmount)
                    .currency(req.getPaymentDetails().getCurrency())
                    .paymentMethod(req.getPaymentDetails().getMethod())
                    .transactionId(req.getPaymentDetails().getTransactionId())
                    .specialRequests(req.getSpecialRequests())
                    .bookingDateTime(LocalDateTime.now())
                    .status(BookingStatus.PENDING)
                    .build();

            hotelBookingRepo.save(booking);

            sendConfirmationEmail(booking);

            // Publish Kafka Event
            try {
                com.ticketkatum.events.hotel.HotelBookingConfirmedEvent event = new com.ticketkatum.events.hotel.HotelBookingConfirmedEvent(
                        com.ticketkatum.events.hotel.HotelBookingConfirmedEvent.HotelBookingPayload.builder()
                                .bookingId(booking.getBookingId())
                                .hotelName(booking.getHotelName())
                                .roomType(booking.getRoomType())
                                .checkInDate(booking.getCheckInDate())
                                .checkOutDate(booking.getCheckOutDate())
                                .totalAmount(booking.getTotalAmount())
                                .customerEmail(booking.getContactEmail())
                                .confirmationNumber(booking.getConfirmationNumber())
                                .build());
                eventPublisher.publishEvent(event, booking.getContactEmail()); // Use email as partition key
            } catch (Exception ex) {
                log.error("Failed to publish hotel booking event", ex);
                // Don't fail the transaction just because Kafka failed
            }

            HotelBookingResponse response = HotelBookingResponse.builder()
                    .bookingId(booking.getBookingId())
                    .confirmationNumber(booking.getConfirmationNumber())
                    .bookingStatus(BookingStatus.PENDING)
                    .hotelName(booking.getHotelName())
                    .roomType(booking.getRoomType())
                    .numberOfRooms(booking.getNumberOfRooms())
                    .checkInDate(booking.getCheckInDate())
                    .checkOutDate(booking.getCheckOutDate())
                    .totalAmount(booking.getTotalAmount())
                    .currency(booking.getCurrency())
                    .bookingDateTime(booking.getBookingDateTime())
                    .message("Booking confirmed. Email sent to " + booking.getContactEmail())
                    .build();

            return ResponseHandler.successWildcard("Hotel booked successfully", response);

        } catch (Exception e) {
            log.error("Booking error: {}", e.getMessage());
            return ResponseHandler.failureWildcard("Booking failed", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void confirmBooking(String bookingId, String transactionId) {

        HotelBooking booking = hotelBookingRepo.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return;
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        hotelBookingRepo.save(booking);

        log.info("Booking {} confirmed successfully", bookingId);
    }

    @Override
    @Transactional
    public Response cancel(Request request) {
        try {
            HotelCancellationRequest req = mapper.convertValue(request, HotelCancellationRequest.class);

            HotelBooking booking = hotelBookingRepo.findByBookingId(req.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getStatus() == BookingStatus.CANCELLED)
                return ResponseHandler.failureWildcard("Booking already cancelled");

            HotelConfig config = hotelConfigRepo.findByHotelName(booking.getHotelName())
                    .orElseThrow(() -> new RuntimeException("Hotel config not found"));

            BigDecimal cancellationCharge = calculateDynamicCancellation(config, booking);
            BigDecimal refundAmount = booking.getTotalAmount().subtract(cancellationCharge);

            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason(req.getReason());
            booking.setCancellationDateTime(LocalDateTime.now());
            booking.setRefundAmount(refundAmount);

            hotelBookingRepo.save(booking);
            sendCancellationEmail(booking);

            return ResponseHandler.successWildcard("Booking cancelled", booking);

        } catch (Exception e) {
            return ResponseHandler.failureWildcard("Cancellation failed", e.getMessage());
        }
    }

    @Override
    @Transactional
    public Response refund(Request request) {
        try {
            HotelRefundRequest req = mapper.convertValue(request, HotelRefundRequest.class);

            HotelBooking booking = hotelBookingRepo.findByBookingId(req.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getStatus() != BookingStatus.CANCELLED)
                return ResponseHandler.failureWildcard("Only cancelled bookings can be refunded");

            BigDecimal refundAmount = booking.getRefundAmount();

            booking.setStatus(BookingStatus.REFUNDED);
            booking.setRefundDateTime(LocalDateTime.now());

            hotelBookingRepo.save(booking);
            sendRefundEmail(booking);

            return ResponseHandler.successWildcard("Refund processed", booking);

        } catch (Exception e) {
            return ResponseHandler.failureWildcard("Refund failed", e.getMessage());
        }
    }

    @Override
    public String getBooking(String bookingId) {
        HotelBooking booking = hotelBookingRepo.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return """
                <html>
                  <body onload="document.forms[0].submit()">
                    <form action="%s" method="GET">
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
                booking.getTotalAmount(),
                booking.getTotalAmount(),
                booking.getId(),
                esewaProperties.getMerchantCode(),
                esewaProperties.getSuccessUrl(),
                esewaProperties.getFailureUrl());
    }

    private BigDecimal calculateDynamicPrice(HotelBookingRequest request, HotelConfig config) {

        try {
            Map<String, Object> prices = new ObjectMapper().readValue(config.getRoomPriceJson(), Map.class);

            String roomType = request.getRoomType().toLowerCase();
            if (!prices.containsKey(roomType)) {
                throw new RuntimeException("Invalid price configuration");
            }

            BigDecimal pricePerNight = new BigDecimal(prices.get(roomType).toString());

            long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());

            BigDecimal subtotal = pricePerNight
                    .multiply(BigDecimal.valueOf(nights))
                    .multiply(BigDecimal.valueOf(request.getNumberOfRooms()));

            BigDecimal tax = subtotal.multiply(config.getTaxRate());
            BigDecimal serviceCharge = subtotal.multiply(config.getServiceCharge());

            return subtotal.add(tax).add(serviceCharge);

        } catch (Exception e) {
            throw new RuntimeException("Invalid price configuration");
        }
    }

    private BigDecimal calculateDynamicCancellation(HotelConfig config, HotelBooking booking) {
        try {
            Map<String, Integer> rules = mapper.readValue(config.getCancellationPolicyJson(), Map.class);

            long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), booking.getCheckInDate().atStartOfDay());

            if (hours > rules.get("free_before_hours"))
                return BigDecimal.ZERO;
            if (hours > rules.get("25_percent_before_hours"))
                return booking.getTotalAmount().multiply(BigDecimal.valueOf(0.25));
            if (hours > rules.get("50_percent_before_hours"))
                return booking.getTotalAmount().multiply(BigDecimal.valueOf(0.50));

            return booking.getTotalAmount();

        } catch (Exception e) {
            throw new RuntimeException("Invalid cancellation configuration");
        }
    }

    private void validate(HotelBookingRequest req) {
        if (req.getCheckInDate().isBefore(LocalDate.now()))
            throw new IllegalArgumentException("Check-in in past");

        if (!req.getCheckOutDate().isAfter(req.getCheckInDate()))
            throw new IllegalArgumentException("Invalid check-out date");

        if (req.getNumberOfRooms() < 1)
            throw new IllegalArgumentException("Invalid room count");
    }

    private String generateBookingId() {
        return "HOTEL-" + System.currentTimeMillis();
    }

    private String generateConfirmationNumber() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void sendConfirmationEmail(HotelBooking booking) {
        try {
            emailService.sendBookingConfirmation(booking);
        } catch (Exception ignored) {
        }
    }

    private void sendCancellationEmail(HotelBooking booking) {
        try {
            emailService.sendCancellationEmail(booking, booking.getRefundAmount(), booking.getTotalAmount());
        } catch (Exception ignored) {
        }
    }

    private void sendRefundEmail(HotelBooking booking) {
        try {
            emailService.sendRefundConfirmation(booking);
        } catch (Exception ignored) {
        }
    }
}
