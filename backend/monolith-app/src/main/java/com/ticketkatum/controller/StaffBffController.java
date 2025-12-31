package com.ticketkatum.controller;

import com.ticketkatum.client.StaffServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.request.StaffRequest;
import com.ticketkatum.dto.hotel.response.StaffResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Staff BFF Controller
 * Handles hotel staff management operations through the BFF layer
 * Proxies requests to Hotel Service - Staff endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/staff")
@RequiredArgsConstructor
public class StaffBffController {

    private final StaffServiceClient staffClient;

    /**
     * Get all staff members for a specific hotel
     * GET /api/bff/v1/staff/hotel/{hotelId}
     *
     * @param hotelId The ID of the hotel
     * @return List of staff members
     */
    @GetMapping("/hotel/{hotelId}")
    public CompletableFuture<ResponseEntity<Response<List<StaffResponse>>>> getStaffByHotel(
            @PathVariable("hotelId") Long hotelId) {

        log.info("Fetching staff for hotel ID: {}", hotelId);

        return staffClient.getStaffByHotel(hotelId)
                .thenApply(staffList -> {
                    Response<List<StaffResponse>> response = Response.<List<StaffResponse>>builder()
                            .statusCode(200)
                            .message("Found " + staffList.size() + " staff members")
                            .data(staffList)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching staff for hotel {}", hotelId, ex);
                    Response<List<StaffResponse>> response = Response.<List<StaffResponse>>builder()
                            .statusCode(500)
                            .message("Failed to fetch staff: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Create a new staff member
     * POST /api/bff/v1/staff/create
     *
     * @param request Staff creation request containing staff details
     * @return Created staff member details
     */
    @PostMapping("/create")
    public CompletableFuture<ResponseEntity<Response<StaffResponse>>> createStaff(
            @RequestBody StaffRequest request) {

        log.info("Creating new staff member for hotel ID: {}", request.getHotelId());

        return staffClient.createStaff(request)
                .thenApply(staff -> {
                    Response<StaffResponse> response = Response.<StaffResponse>builder()
                            .statusCode(200)
                            .message("Staff created successfully")
                            .data(staff)
                            .build();
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                })
                .exceptionally(ex -> {
                    log.error("Error creating staff", ex);
                    Response<StaffResponse> response = Response.<StaffResponse>builder()
                            .statusCode(500)
                            .message("Failed to create staff: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Update staff member status
     * PUT /api/bff/v1/staff/{staffId}/status
     *
     * @param staffId The ID of the staff member
     * @param status New status (e.g., ACTIVE, INACTIVE)
     * @return Updated staff member details
     */
    @PutMapping("/{staffId}/status")
    public CompletableFuture<ResponseEntity<Response<StaffResponse>>> updateStaffStatus(
            @PathVariable("staffId") Long staffId,
            @RequestParam(name = "status") String status) {

        log.info("Updating staff {} status to: {}", staffId, status);

        return staffClient.updateStaffStatus(staffId, status)
                .thenApply(staff -> {
                    Response<StaffResponse> response = Response.<StaffResponse>builder()
                            .statusCode(200)
                            .message("Staff status updated successfully")
                            .data(staff)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error updating staff {} status", staffId, ex);
                    Response<StaffResponse> response = Response.<StaffResponse>builder()
                            .statusCode(500)
                            .message("Failed to update staff status: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }
}
