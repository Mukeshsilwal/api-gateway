package com.ticketkatum.service;

import com.ticketkatum.client.*;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Ticket Domain Aggregator
 * Handles ticket generation and management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketAggregator {

    private final TicketServiceClient ticketClient;
    private final BookingSeatServiceClient bookingClient;
    private final SeatServiceClient seatClient;
    private final BusServiceClient busClient;
    private final RouteServiceClient routeClient;

    /**
     * Generate ticket with complete details (PDF + Email)
     */
    public CompletableFuture<CompleteTicketResponse> generateCompleteTicket(Long ticketId) {
        log.info("Generating complete ticket for ticketId: {}", ticketId);

        return ticketClient.getTicketById(ticketId)
                .thenCompose(ticket -> {
                    // Fetch all related data in parallel
                    CompletableFuture<BookingTicketDto> bookingFuture =
                            bookingClient.getBookingById(ticket.getBookingTicket().getBookingId());

                    CompletableFuture<SeatDto> seatFuture =
                            seatClient.getSeatById(ticket.getBookingTicket().getSeatIds());

                    return CompletableFuture.allOf(bookingFuture, seatFuture)
                            .thenCompose(v -> {
                                SeatDto seat = seatFuture.join();

                                return busClient.getBusById(seat.getId())
                                        .thenCompose(bus -> {
                                            return routeClient.getRouteById(bus.getRouteDto().getId())
                                                    .thenCompose(route -> {
                                                        // Generate PDF
                                                        return ticketClient.generateTicketPDF(ticketId)
                                                                .thenApply(pdfData ->
                                                                        CompleteTicketResponse.builder()
                                                                                .ticket(ticket)
                                                                                .booking(bookingFuture.join())
                                                                                .seat(seat)
                                                                                .bus(bus)
                                                                                .route(route)
                                                                                .pdfData(pdfData)
                                                                                .ticketGenerated(true)
                                                                                .emailSent(true)
                                                                                .build()
                                                                );
                                                    });
                                        });
                            });
                })
                .exceptionally(ex -> {
                    log.error("Error generating complete ticket", ex);
                    throw new RuntimeException("Ticket generation failed", ex);
                });
    }

    /**
     * Get ticket details with journey information
     */
    public CompletableFuture<TicketDetailsResponse> getTicketDetails(Long ticketId) {
        log.info("Fetching ticket details for: {}", ticketId);

        return ticketClient.getTicketById(ticketId)
                .thenCompose(ticket -> {
                    CompletableFuture<SeatDto> seatFuture =
                            seatClient.getSeatById(ticket.getBookingTicket().getSeatIds());

                    CompletableFuture<BookingTicketDto> bookingFuture =
                            bookingClient.getBookingById(ticket.getBookingTicket().getBookingId());

                    return CompletableFuture.allOf(seatFuture, bookingFuture)
                            .thenCompose(v -> {
                                SeatDto seat = seatFuture.join();

                                return busClient.getBusById(seat.getId())
                                        .thenCompose(bus -> {
                                            return routeClient.getRouteById(bus.getRouteDto().getId())
                                                    .thenApply(route ->
                                                            TicketDetailsResponse.builder()
                                                                    .ticket(ticket)
                                                                    .booking(bookingFuture.join())
                                                                    .seat(seat)
                                                                    .bus(bus)
                                                                    .route(route)
                                                                    .passengerName(ticket.getBookingTicket().getFullName())
                                                                    .build()
                                                    );
                                        });
                            });
                })
                .exceptionally(ex -> {
                    log.error("Error fetching ticket details", ex);
                    throw new AggregationException("Failed to fetch ticket details", ex);
                });
    }

    /**
     * Create ticket and send email with PDF
     */
    public CompletableFuture<TicketCreationResponse> createTicketWithEmail(
            TicketDto ticketDto, Long seatId, Long bookingId) {

        log.info("Creating ticket for seat: {}, booking: {}", seatId, bookingId);

        return ticketClient.createTicket(ticketDto, seatId, bookingId)
                .thenCompose(createdTicket -> {
                    // Generate PDF and send email
                    return generateCompleteTicket(createdTicket.getTicketNo())
                            .thenApply(completeTicket ->
                                    TicketCreationResponse.builder()
                                            .ticket(createdTicket)
                                            .ticketId(createdTicket.getTicketNo())
                                            .pdfGenerated(true)
                                            .emailSent(true)
                                            .message("Ticket created and sent successfully")
                                            .build()
                            );
                })
                .exceptionally(ex -> {
                    log.error("Error creating ticket with email", ex);
                    throw new AggregationException("Ticket creation failed", ex);
                });
    }
}