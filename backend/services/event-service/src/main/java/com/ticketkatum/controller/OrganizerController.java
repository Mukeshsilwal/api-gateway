package com.ticketkatum.controller;

import com.ticketkatum.dto.Response;
import com.ticketkatum.entity.Event;
import com.ticketkatum.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Organizer Controller
 * REST API for organizer-specific operations
 */
@Slf4j
@RestController
@RequestMapping("/api/organizers")
@RequiredArgsConstructor
@Tag(name = "Organizers", description = "Organizer management APIs")
public class OrganizerController {

    private final EventService eventService;

    @GetMapping("/{id}/events")
    @Operation(summary = "Get organizer events")
    public ResponseEntity<Response<Page<Event>>> getOrganizerEvents(
            @PathVariable("id") Long id,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Event> events = eventService.getOrganizerEvents(id, status, pageable);
            return ResponseEntity.ok(Response.success(events));
        } catch (Exception e) {
            log.error("Error fetching organizer events", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Response.error(400, e.getMessage()));
        }
    }
}
