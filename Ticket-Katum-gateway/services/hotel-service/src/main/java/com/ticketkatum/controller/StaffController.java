package com.ticketkatum.controller;

import com.ticketkatum.model.StaffRequest;
import com.ticketkatum.model.StaffResponse;
import com.ticketkatum.service.StaffService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    /**
     * Get all staff of a hotel
     * GET /staff/hotel/{hotelId}
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<Response<List<StaffResponse>>> getStaffByHotel(@PathVariable("hotelId") Long hotelId) {
        log.info("Fetching staff for hotelId: {}", hotelId);

        try {
            List<StaffResponse> staffList = staffService.getStaffByHotel(hotelId);
            Response<List<StaffResponse>> response = ResponseHandler.success(
                    "Found " + staffList.size() + " staff members",
                    staffList
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching staff for hotelId: {}", hotelId, e);
            Response<List<StaffResponse>> response = ResponseHandler.failure(
                    "Failed to fetch staff: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Create staff
     * POST /staff/create
     */
    @PostMapping("/create")
    public ResponseEntity<Response<StaffResponse>> createStaff(
            @RequestBody StaffRequest request) {

        log.info("Creating new staff");

        try {
            StaffResponse created = staffService.createStaff(request);
            Response<StaffResponse> response = ResponseHandler.success(
                    "Staff created successfully",
                    created
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating staff", e);
            Response<StaffResponse> response = ResponseHandler.failure(
                    "Failed to create staff: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Update staff status (e.g. ACTIVE, INACTIVE)
     * PUT /staff/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Response<StaffResponse>> updateStaffStatus(
            @PathVariable("id") Long id,
            @RequestParam String status) {

        log.info("Updating status for staffId: {} -> {}", id, status);

        try {
            StaffResponse updated = staffService.updateStatus(id, status);
            Response<StaffResponse> response = ResponseHandler.success(
                    "Staff status updated successfully",
                    updated
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating staff status for staffId: {}", id, e);
            Response<StaffResponse> response = ResponseHandler.failure(
                    "Failed to update staff status: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
