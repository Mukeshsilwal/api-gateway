package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.bus.TicketCreationRequest;
import com.ticketkatum.dto.bus.TicketCreationResponse;
import com.ticketkatum.dto.bus.TicketDetailsResponse;
import com.ticketkatum.service.TicketAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * Ticket BFF Controller
 * Handles ticket generation and management
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/tickets")
@RequiredArgsConstructor
@Tag(name = "Ticket BFF", description = "Ticket management aggregated APIs")
public class TicketBffController {

    private final TicketAggregator ticketAggregator;

    /**
     * Generate complete ticket
     * Aggregates: ticket info, PDF generation, email sending
     */
    @GetMapping("/{ticketId}/generate")
    @Operation(summary = "Generate complete ticket",
            description = "Generate ticket PDF and send email")
    public CompletableFuture<ResponseEntity<byte[]>> generateCompleteTicket(
            @PathVariable Long ticketId) {

        log.info("BFF: Generating complete ticket for: {}", ticketId);

        return ticketAggregator.generateCompleteTicket(ticketId)
                .thenApply(response -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    headers.setContentDispositionFormData("attachment", "ticket-" + ticketId + ".pdf");

                    return ResponseEntity.ok()
                            .headers(headers)
                            .body(response.getPdfData());
                })
                .exceptionally(ex -> {
                    log.error("Ticket generation failed", ex);
                    return ResponseEntity.status(500).build();
                });
    }

    /**
     * Get ticket details
     * Aggregates: ticket, booking, seat, bus, route info
     */
    @GetMapping("/{ticketId}/details")
    @Operation(summary = "Get ticket details",
            description = "Returns complete ticket information")
    public CompletableFuture<ResponseEntity<Response<TicketDetailsResponse>>> getTicketDetails(
            @PathVariable Long ticketId) {

        log.info("BFF: Fetching ticket details for: {}", ticketId);

        return ticketAggregator.getTicketDetails(ticketId)
                .thenApply(details -> ResponseEntity.ok(
                        new Response<>(200, "Ticket details retrieved", details)))
                .exceptionally(ex -> {
                    log.error("Error fetching ticket", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "Ticket not found", null));
                });
    }

    /**
     * Create ticket with email
     * Aggregates: ticket creation, PDF generation, email sending
     */
    @PostMapping("/create-with-email")
    @Operation(summary = "Create ticket with email",
            description = "Create ticket and send confirmation email")
    public CompletableFuture<ResponseEntity<Response<TicketCreationResponse>>> createTicketWithEmail(
            @Valid @RequestBody TicketCreationRequest request) {

        log.info("BFF: Creating ticket with email for seat: {}", request.getSeatId());

        return ticketAggregator.createTicketWithEmail(
                        request.getTicketDto(),
                        request.getSeatId(),
                        request.getBookingId()
                ).thenApply(response -> ResponseEntity.ok(
                        new Response<>(201, "Ticket created and sent", response)))
                .exceptionally(ex -> {
                    log.error("Ticket creation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Ticket creation failed", null));
                });
    }
}
