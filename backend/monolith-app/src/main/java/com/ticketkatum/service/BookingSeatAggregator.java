package com.ticketkatum.service;

import com.ticketkatum.client.*;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Booking Domain Aggregator
 * Handles all booking-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSeatAggregator {

    private final BookingSeatServiceClient bookingClient;
    private final BookingRequestServiceClient bookingRequestClient;
    private final BusServiceClient busClient;
    private final SeatServiceClient seatClient;
    private final TicketServiceClient ticketClient;

    /**
     * Complete booking flow: check seat -> reserve -> create booking -> generate ticket
     */
    @Transactional
    public CompletableFuture<CompleteBookingResponse> completeBookingFlow(
            CompleteBookingRequest request) {

        log.info("Starting complete booking flow for seat: {}", request.getSeatId());

        // Step 1: Check seat availability
        return seatClient.getSeatById(request.getBookingTicket().getSeatIds())
                .thenCompose(seat -> {
                    if (seat.isReserved()) {
                        throw new AggregationException("Seat already booked");
                    }

                    // Step 2: Reserve seat
                    return bookingRequestClient.reserveSeat(
                            request.getBookingRequest(),
                            request.getSeatId()
                    ).thenCompose(reservation -> {
                        // Step 3: Create booking ticket
                        return bookingClient.createBooking(request.getBookingTicket())
                                .thenCompose(bookingTicket -> {
                                    // Step 4: Generate ticket
                                    return ticketClient.createTicket(
                                            request.getTicketDto(),
                                            Long.valueOf(request.getSeatId()),
                                            bookingTicket.getBookingId()
                                    ).thenCompose(ticket -> {
                                        // Step 5: Get complete bus info
                                        return busClient.getBusById(seat.getBusId())
                                                .thenApply(bus ->
                                                        CompleteBookingResponse.builder()
                                                                .reservation(reservation)
                                                                .bookingTicket(bookingTicket)
                                                                .ticket(ticket)
                                                                .seat(seat)
                                                                .bus(bus)
                                                                .bookingReference(generateBookingReference())
                                                                .status("CONFIRMED")
                                                                .message("Booking completed successfully")
                                                                .build()
                                                );
                                    });
                                });
                    });
                })
                .exceptionally(ex -> {
                    log.error("Booking flow failed", ex);
                    throw new AggregationException("Booking failed: " + ex.getMessage(), ex);
                });
    }

    /**
     * Get booking details with ticket and seat info
     */
    public CompletableFuture<AggregatedBookingDetails> getBookingDetails(Integer bookingId) {
        log.info("Fetching complete booking details for: {}", bookingId);

        return bookingClient.getBookingById(bookingId)
                .thenCompose(booking -> {
                    // Fetch related ticket
                    CompletableFuture<TicketDto> ticketFuture =
                            ticketClient.getTicketByBookingId(bookingId)
                                    .exceptionally(ex -> null);

                    return ticketFuture.thenCompose(ticket -> {
                        if (ticket == null) {
                            return CompletableFuture.completedFuture(
                                    AggregatedBookingDetails.builder()
                                            .booking(booking)
                                            .build()
                            );
                        }

                        // Fetch seat info
                        return seatClient.getSeatById(ticket.getBookingTicket().getSeatIds())
                                .thenCompose(seat -> {
                                    // Fetch bus info
                                    return busClient.getBusById(Long.valueOf(seat.getSeatNumber()))
                                            .thenApply(bus ->
                                                    AggregatedBookingDetails.builder()
                                                            .booking(booking)
                                                            .ticket(ticket)
                                                            .seat(seat)
                                                            .bus(bus)
                                                            .canCancel(canCancelBooking(booking))
                                                            .cancellationDeadline(
                                                                    calculateCancellationDeadline(bus))
                                                            .build()
                                            );
                                });
                    });
                })
                .exceptionally(ex -> {
                    log.error("Error fetching booking details", ex);
                    throw new AggregationException("Failed to fetch booking details", ex);
                });
    }

    /**
     * Get all bookings with details
     */
    public CompletableFuture<List<AggregatedBookingDetails>> getAllBookingsWithDetails() {
        log.info("Fetching all bookings with details");

        return bookingClient.getAllBookings()
                .thenCompose(bookings -> {
                    List<CompletableFuture<AggregatedBookingDetails>> futures = bookings.stream()
                            .map(booking -> getBookingDetails((int) booking.getBookingId()))
                            .toList();

                    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                            .thenApply(v -> futures.stream()
                                    .map(CompletableFuture::join)
                                    .collect(Collectors.toList()));
                });
    }

    /**
     * Cancel booking with seat release
     */
    public CompletableFuture<CancellationResponse> cancelBookingWithSeatRelease(
            String email, String ticketNo) {

        log.info("Cancelling booking for email: {}, ticket: {}", email, ticketNo);

        return bookingRequestClient.cancelReservation(email, ticketNo)
                .thenApply(v ->
                        CancellationResponse.builder()
                                .success(true)
                                .message("Booking cancelled successfully")
                                .email(email)
                                .ticketNo(ticketNo)
                                .refundStatus("PROCESSING")
                                .build()
                )
                .exceptionally(ex -> {
                    log.error("Cancellation failed", ex);
                    return CancellationResponse.builder()
                            .success(false)
                            .message("Cancellation failed: " + ex.getMessage())
                            .build();
                });
    }

    /**
     * Get user bookings history
     */
    public CompletableFuture<BookingHistoryResponse> getUserBookingHistory(String userEmail) {
        log.info("Fetching booking history for: {}", userEmail);

        return bookingClient.getAllBookings()
                .thenCompose(bookings -> {
                    List<BookingTicketDto> userBookings = bookings.stream()
                            .filter(b -> userEmail.equalsIgnoreCase(b.getEmail()))
                            .collect(Collectors.toList());

                    // Enrich with details
                    List<CompletableFuture<AggregatedBookingDetails>> futures =
                            userBookings.stream()
                                    .map(b -> getBookingDetails((int) b.getBookingId()))
                                    .toList();

                    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                            .thenApply(v -> {
                                List<AggregatedBookingDetails> details = futures.stream()
                                        .map(CompletableFuture::join)
                                        .collect(Collectors.toList());

                                return BookingHistoryResponse.builder()
                                        .userEmail(userEmail)
                                        .bookings(details)
                                        .totalBookings(details.size())
                                        .completedBookings(countCompleted(details))
                                        .cancelledBookings(countCancelled(details))
                                        .build();
                            });
                });
    }

    // ============ Helper Methods ============

    private String generateBookingReference() {
        return "BUS" + System.currentTimeMillis() +
                String.format("%04d", new java.util.Random().nextInt(10000));
    }

    private boolean canCancelBooking(BookingTicketDto booking) {
        // Implement cancellation policy logic
        return true; // Placeholder
    }

    private String calculateCancellationDeadline(BusDto bus) {
        // Calculate deadline based on departure time
        return "2 hours before departure"; // Placeholder
    }

    private int countCompleted(List<AggregatedBookingDetails> bookings) {
        return (int) bookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getBooking().getStatus()))
                .count();
    }

    private int countCancelled(List<AggregatedBookingDetails> bookings) {
        return (int) bookings.stream()
                .filter(b -> "CANCELLED".equalsIgnoreCase(b.getBooking().getStatus()))
                .count();
    }
}
