package com.ticketkatum.controller;

import com.itextpdf.text.DocumentException;
import com.ticketkatum.entity.Ticket;
import com.ticketkatum.mapper.TicketMapper;
import com.ticketkatum.model.TicketDto;
import com.ticketkatum.service.TicketPDFService;
import com.ticketkatum.service.TicketService;
import com.ticketkatum.utils.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketPDFService ticketPDFService;
    private final TicketService ticketService;
    private final TicketMapper ticketMapper;

    /**
     * Generate ticket PDF + send email + download file
     */
    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateTicket(@RequestParam long ticketId) throws DocumentException {

        log.info("Generating Ticket PDF for ticketId={}", ticketId);
        TicketDto ticket = ticketService.getTicketById(ticketId);
        Ticket ticketMapperEntity=ticketMapper.toEntity(ticket);


        byte[] pdfData = ticketPDFService.generateTicketPDF(ticketMapperEntity);
        String userEmail = ticket.getBookingTicket().getEmail();

        ticketService.sendBookingConfirmationEmail(userEmail, pdfData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + ticketId + ".pdf");
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());

        return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
    }

    /**
     * Update Ticket
     */
    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> updateTicket(
            @RequestBody TicketDto ticketDto, @PathVariable long id) {

        log.info("Updating ticket with ID {}", id);
        TicketDto updated = ticketService.updateTicket(ticketDto, id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Create Ticket for specific seat
     */
    @PostMapping("/seat/{seatId}/book/{bookingId}")
    public ResponseEntity<TicketDto> createTicketForSeat(@RequestBody TicketDto ticketDto,
                                                         @PathVariable("seatId") long seatId,
                                                         @PathVariable("bookingId") long bookingId) {

        log.info("Creating ticket for seatId={}, bookingId={}", seatId, bookingId);
        TicketDto created = ticketService.createSeatWithTicket(ticketDto, seatId, bookingId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicket(@PathVariable long id) {

        log.info("Fetching ticket with id={}", id);

        TicketDto ticketDto = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticketDto);
    }

}
