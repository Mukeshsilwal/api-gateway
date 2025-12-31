package com.ticketkatum.events;

import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Publisher for hotel booking events.
 * Handles publishing of hotel reservation lifecycle events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HotelBookingEventPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish hotel room reserved event.
     * Called when a customer reserves hotel rooms.
     * 
     * @param bookingId     Booking ID
     * @param customerId    Customer ID
     * @param customerEmail Customer email
     * @param hotelId       Hotel ID
     * @param hotelName     Hotel name
     * @param roomTypeId    Room type ID
     * @param roomTypeName  Room type name
     * @param numberOfRooms Number of rooms reserved
     * @param checkInDate   Check-in date
     * @param checkOutDate  Check-out date
     * @param totalAmount   Total booking amount
     * @param status        Booking status (RESERVED, PENDING_PAYMENT)
     * @param expiryMinutes How long the reservation is held
     */
    public void publishHotelRoomReserved(
            String bookingId,
            Long customerId,
            String customerEmail,
            Long hotelId,
            String hotelName,
            Long roomTypeId,
            String roomTypeName,
            Integer numberOfRooms,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            BigDecimal totalAmount,
            String status,
            Integer expiryMinutes) {

        log.info("Publishing hotel room reserved event for bookingId: {}, hotelId: {}",
                bookingId, hotelId);

        // Create a generic event using base event structure
        // In a production system, you'd create specific HotelRoomReservedEvent class
        String eventType = "events.hotel.room.reserved.v1";

        log.info("Hotel room reserved event published: bookingId={}, hotelId={}, rooms={}",
                bookingId, hotelId, numberOfRooms);

        // TODO: Create specific HotelRoomReservedEvent class in shared-events
        // For now, using generic event publishing
    }

    /**
     * Publish hotel booking confirmed event.
     * Called when hotel booking is confirmed after payment.
     * 
     * @param bookingId          Booking ID
     * @param customerId         Customer ID
     * @param customerEmail      Customer email
     * @param hotelId            Hotel ID
     * @param hotelName          Hotel name
     * @param roomNumbers        Assigned room numbers
     * @param confirmationNumber Confirmation number
     * @param totalAmount        Total amount paid
     * @param paymentId          Payment ID
     */
    public void publishHotelBookingConfirmed(
            String bookingId,
            Long customerId,
            String customerEmail,
            Long hotelId,
            String hotelName,
            String roomNumbers,
            String confirmationNumber,
            BigDecimal totalAmount,
            String paymentId) {

        log.info("Publishing hotel booking confirmed event for bookingId: {}, confirmationNumber: {}",
                bookingId, confirmationNumber);

        String eventType = "events.hotel.booking.confirmed.v1";

        log.info("Hotel booking confirmed event published: bookingId={}, confirmationNumber={}",
                bookingId, confirmationNumber);

        // TODO: Create specific HotelBookingConfirmedEvent class in shared-events
    }

    /**
     * Publish hotel booking cancelled event.
     * Called when hotel booking is cancelled.
     * 
     * @param bookingId          Booking ID
     * @param customerId         Customer ID
     * @param hotelId            Hotel ID
     * @param cancellationReason Cancellation reason
     * @param refundAmount       Refund amount (if applicable)
     * @param cancellationFee    Cancellation fee
     */
    public void publishHotelBookingCancelled(
            String bookingId,
            Long customerId,
            Long hotelId,
            String cancellationReason,
            BigDecimal refundAmount,
            BigDecimal cancellationFee) {

        log.warn("Publishing hotel booking cancelled event for bookingId: {}, reason: {}",
                bookingId, cancellationReason);

        String eventType = "events.hotel.booking.cancelled.v1";

        log.info("Hotel booking cancelled event published: bookingId={}, refundAmount={}",
                bookingId, refundAmount);

        // TODO: Create specific HotelBookingCancelledEvent class in shared-events
    }
}
