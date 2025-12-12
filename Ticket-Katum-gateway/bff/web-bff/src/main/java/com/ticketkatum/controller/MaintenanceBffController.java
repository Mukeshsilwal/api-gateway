package com.ticketkatum.controller;

import com.ticketkatum.client.MaintenanceServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.request.RoomMaintenanceRequest;
import com.ticketkatum.dto.hotel.response.RoomMaintenanceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * Maintenance BFF Controller
 * Handles room maintenance operations through the BFF layer
 * Proxies requests to Hotel Service - Room Maintenance endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceBffController {

    private final MaintenanceServiceClient maintenanceClient;

    /**
     * Create or update a room maintenance record
     * POST /api/bff/v1/maintenance/save
     *
     * @param request Room maintenance request containing maintenance details
     * @return Created or updated maintenance record
     */
    @PostMapping("/save")
    public CompletableFuture<ResponseEntity<Response<RoomMaintenanceResponse>>> createOrUpdateMaintenance(
            @RequestBody RoomMaintenanceRequest request) {

        log.info("Creating/updating maintenance for room ID: {}", request.getRoomId());

        return maintenanceClient.createOrUpdate(request)
                .thenApply(maintenance -> {
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(200)
                            .message("Room maintenance updated successfully")
                            .data(maintenance)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error creating/updating maintenance for room {}", request.getRoomId(), ex);
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(500)
                            .message("Failed to update maintenance: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Assign a staff member to a maintenance task
     * POST /api/bff/v1/maintenance/assign/{maintenanceId}
     *
     * @param maintenanceId The ID of the maintenance record
     * @param staffName Name of the staff member to assign
     * @return Updated maintenance record with assigned staff
     */
    @PostMapping("/assign/{maintenanceId}")
    public CompletableFuture<ResponseEntity<Response<RoomMaintenanceResponse>>> assignStaffToMaintenance(
            @PathVariable Long maintenanceId,
            @RequestParam String staffName) {

        log.info("Assigning staff '{}' to maintenance ID: {}", staffName, maintenanceId);

        return maintenanceClient.assignStaff(maintenanceId, staffName)
                .thenApply(maintenance -> {
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(200)
                            .message("Staff assigned successfully")
                            .data(maintenance)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error assigning staff to maintenance {}", maintenanceId, ex);
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(500)
                            .message("Failed to assign staff: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Get maintenance record for a specific room
     * GET /api/bff/v1/maintenance/room/{roomId}
     *
     * @param roomId The ID of the room
     * @return Maintenance record for the room
     */
    @GetMapping("/room/{roomId}")
    public CompletableFuture<ResponseEntity<Response<RoomMaintenanceResponse>>> getMaintenanceByRoomId(
            @PathVariable("roomId") Long roomId) {

        log.info("Fetching maintenance record for room ID: {}", roomId);

        return maintenanceClient.getMaintenanceByRoomId(roomId)
                .thenApply(maintenance -> {
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(200)
                            .message("Maintenance record fetched successfully")
                            .data(maintenance)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching maintenance for room {}", roomId, ex);
                    Response<RoomMaintenanceResponse> response = Response.<RoomMaintenanceResponse>builder()
                            .statusCode(500)
                            .message("Maintenance not found: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
