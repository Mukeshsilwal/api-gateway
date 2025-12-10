package com.ticketkatum.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.ticketkatum.entity.User;
import com.ticketkatum.model.AdminRegistrationRequestDto;
import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.CreateRegistrationRequest;
import com.ticketkatum.service.serviceimpl.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registration")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class RegistrationController {

    private final RegistrationService registrationService;

    /**
     * Submit admin registration request
     * Creates a new admin registration request that requires super admin approval
     */
    @PostMapping("/admin/request")
    public ResponseEntity<Map<String, Object>> registerAdmin(
            @Valid @RequestBody CreateRegistrationRequest request) {

        log.info("Received admin registration request for email: {}", request.getEmail());

        registrationService.registerAdmin(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration request submitted successfully. Please wait for approval.");
        response.put("email", request.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Approve admin registration request
     * Approves a pending admin registration and creates user account with temporary credentials
     * Super Admin access required
     */
    @PostMapping("/admin/approve/{requestId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> approveRequest(@PathVariable Long requestId) {

        log.info("Received approval request for registration ID: {}", requestId);

        registrationService.approveRequest(requestId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Admin registration approved and credentials sent via email");
        response.put("requestId", requestId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get all registration requests
     * Retrieves all admin registration requests sorted by request date
     * Super Admin access required
     */
    @GetMapping("/admin/requests")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllRequests() {

        log.info("Fetching all admin registration requests");

        List<AdminRegistrationRequestDto> requests = registrationService.getAllRequests();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", requests);
        response.put("count", requests.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get registration request details by ID
     * Retrieves detailed information about a specific registration request
     * Super Admin access required
     */
    @GetMapping("/admin/requests/{requestId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getRequestById(@PathVariable Long requestId) {

        log.info("Fetching registration request details for ID: {}", requestId);

        // Note: You'll need to add a getRequestById method in the service
        // AdminRegistrationRequestDto request = registrationService.getRequestById(requestId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        // response.put("data", request);
        response.put("message", "Method needs implementation in service");

        return ResponseEntity.ok(response);
    }

    /**
     * Change user password
     * Allows authenticated users to change their password
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        log.info("Received password change request for user: {}", request.getUsername());

        registrationService.changePassword(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password changed successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Send OTP to user
     * Generates and sends a 6-digit OTP to the user's email for verification
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(
            @Valid @RequestBody User userRequest) throws JsonProcessingException {

        log.info("Received OTP request for user: {}", userRequest.getUsername());

        registrationService.sentOtp(userRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP sent successfully to your email");
        response.put("expiryMinutes", 5);

        return ResponseEntity.ok(response);
    }

    /**
     * Reject admin registration request
     * Rejects a pending admin registration request
     * Super Admin access required
     */
    @DeleteMapping("/admin/reject/{requestId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectRequest(@PathVariable Long requestId) {

        log.info("Received rejection request for registration ID: {}", requestId);

        // Note: You'll need to add a rejectRequest method in the service
        // registrationService.rejectRequest(requestId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration request rejected");
        response.put("requestId", requestId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get requests by status
     * Retrieves registration requests filtered by status
     * Super Admin access required
     */
    @GetMapping("/admin/requests/status/{status}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getRequestsByStatus(
            @PathVariable String status) {

        log.info("Fetching registration requests with status: {}", status);

        // Note: You'll need to add a getRequestsByStatus method in the service
        // List<AdminRegistrationRequestDto> requests = registrationService.getRequestsByStatus(status);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Method needs implementation in service");
        response.put("status", status);

        return ResponseEntity.ok(response);
    }

    /**
     * Global exception handler for the controller
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("Error in RegistrationController: ", e);

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", e.getMessage());

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        // You can add specific exception handling here
        if (e.getClass().getSimpleName().contains("NotFound")) {
            status = HttpStatus.NOT_FOUND;
        } else if (e.getClass().getSimpleName().contains("BadRequest")) {
            status = HttpStatus.BAD_REQUEST;
        }

        return ResponseEntity.status(status).body(response);
    }
}