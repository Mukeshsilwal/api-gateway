package com.ticketkatum.sos.controller;

import com.ticketkatum.sos.dto.ContactRequest;
import com.ticketkatum.sos.dto.SOSRequest;
import com.ticketkatum.sos.dto.SOSResponse;
import com.ticketkatum.sos.entity.EmergencyContact;
import com.ticketkatum.sos.service.SosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safety")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "SOS Management", description = "APIs for Emergency SOS and Contacts")
public class SosController {

    private final SosService sosService;

    @PostMapping("/sos")
    @Operation(summary = "Trigger SOS", description = "Trigger an emergency SOS alert")
    public ResponseEntity<SOSResponse> triggerSos(@Valid @RequestBody SOSRequest request) {
        log.info("SOS triggered for user: {}", request.getUserId());
        SOSResponse response = sosService.triggerSos(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/sos/{alertId}/resolve")
    @Operation(summary = "Resolve SOS", description = "Mark an SOS alert as resolved")
    public ResponseEntity<SOSResponse> resolveSos(
            @PathVariable Long alertId,
            @RequestParam Long resolvedBy) {
        log.info("Resolving SOS alert: {}", alertId);
        SOSResponse response = sosService.resolveSos(alertId, resolvedBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/contacts")
    @Operation(summary = "Get contacts", description = "Get emergency contacts for a user")
    public ResponseEntity<List<EmergencyContact>> getContacts(@RequestParam Long userId) {
        return ResponseEntity.ok(sosService.getContacts(userId));
    }

    @PostMapping("/contacts")
    @Operation(summary = "Add contact", description = "Add a new emergency contact")
    public ResponseEntity<EmergencyContact> addContact(@Valid @RequestBody ContactRequest request) {
        log.info("Adding contact for user: {}", request.getUserId());
        EmergencyContact contact = sosService.addContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }

    @DeleteMapping("/contacts/{contactId}")
    @Operation(summary = "Delete contact", description = "Delete an emergency contact")
    public ResponseEntity<Void> deleteContact(@PathVariable Long contactId) {
        sosService.deleteContact(contactId);
        return ResponseEntity.noContent().build();
    }
}
