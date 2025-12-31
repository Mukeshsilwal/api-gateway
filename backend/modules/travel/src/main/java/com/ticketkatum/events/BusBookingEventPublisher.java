package com.ticketkatum.events;

import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Publisher for bus booking events.
 * Handles publishing of bus seat reservation lifecycle events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BusBookingEventPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish bus seat reserved event.
     * Called when a customer reserves bus seats.
     * 
     * @param bookingId     Booking ID
     * @param customerId    Customer ID
     * @param customerEmail Customer email
     * @param busId         Bus ID
     * @param busName       Bus name
     * @param route         Bus route
     * @param seatNumbers   Reserved seat numbers
     * @param numberOfSeats Number of seats reserved
     * @param departureTime Departure time
     * @param arrivalTime   Arrival time
     * @param totalAmount   Total booking amount
     * @param status        Booking status (RESERVED, PENDING_PAYMENT)
     * @param expiryMinutes How long the reservation is held
     */
    public void publishBusSeatReserved(
            String bookingId,
            Long customerId,
            String customerEmail,
            Long busId,
            String busName,
            String route,
            String seatNumbers,
            Integer numberOfSeats,
            LocalDateTime departureTime,
            LocalDateTime arrivalTime,
            BigDecimal totalAmount,
            String status,
            Integer expiryMinutes) {

        log.info("Publishing bus seat reserved event for bookingId: {}, busId: {}, seats: {}",
                bookingId, busId, seatNumbers);

        String eventType = "events.bus.seat.reserved.v1";

        log.info("Bus seat reserved event published: bookingId={}, busId={}, seats={}",
                bookingId, busId, numberOfSeats);

        // TODO: Create specific BusSeatReservedEvent class in shared-events
    }

    /**
     * Publish bus booking confirmed event.
     * Called when bus booking is confirmed after payment.
     * 
     * @param bookingId          Booking ID
     * @param customerId         Customer ID
     * @param customerEmail      Customer email
     * @param busId              Bus ID
     * @param busName            Bus name
     * @param route              Bus route
     * @param seatNumbers        Confirmed seat numbers
     * @param confirmationNumber Confirmation number
     * @param ticketNumber       Ticket number
     * @param totalAmount        Total amount paid
     * @param paymentId          Payment ID
     */
    public void publishBusBookingConfirmed(
            String bookingId,
            Long customerId,
            String customerEmail,
            Long busId,
            String busName,
            String route,
            String seatNumbers,
            String confirmationNumber,
            String ticketNumber,
            BigDecimal totalAmount,
            String paymentId) {

        log.info("Publishing bus booking confirmed event for bookingId: {}, confirmationNumber: {}",
                bookingId, confirmationNumber);

        String eventType = "events.bus.booking.confirmed.v1";

        log.info("Bus booking confirmed event published: bookingId={}, ticketNumber={}",
                bookingId, ticketNumber);

        // TODO: Create specific BusBookingConfirmedEvent class in shared-events
    }

    /**
     * Publish bus booking cancelled event.
     * Called when bus booking is cancelled.
     * 
     * @param bookingId          Booking ID
     * @param customerId         Customer ID
     * @param busId              Bus ID
     * @param cancellationReason Cancellation reason
     * @param refundAmount       Refund amount (if applicable)
     * @param cancellationFee    Cancellation fee
     */
    public void publishBusBookingCancelled(
            String bookingId,
            Long customerId,
            Long busId,
            String cancellationReason,
            BigDecimal refundAmount,
            BigDecimal cancellationFee) {

        log.warn("Publishing bus booking cancelled event for bookingId: {}, reason: {}",
                bookingId, cancellationReason);

        String eventType = "events.bus.booking.cancelled.v1";

        log.info("Bus booking cancelled event published: bookingId={}, refundAmount={}",
                bookingId, refundAmount);

        // TODO: Create specific BusBookingCancelledEvent class in shared-events
    }
}
