package com.ticketkatum.controller;

import com.ticketkatum.model.RoomMaintenanceRequest;
import com.ticketkatum.model.RoomMaintenanceResponse;
import com.ticketkatum.service.RoomMaintenanceService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class RoomMaintenanceController {

    private final RoomMaintenanceService maintenanceService;

    /**
     * Create or update maintenance record for a room.
     * POST /maintenance/save
     */
    @PostMapping("/save")
    public ResponseEntity<Response<RoomMaintenanceResponse>> createOrUpdate(
            @RequestBody RoomMaintenanceRequest request) {

        log.info("Creating/updating maintenance for room: {}", request.getRoomId());

        try {
            RoomMaintenanceResponse responseData = maintenanceService.createOrUpdate(request);
            Response<RoomMaintenanceResponse> response = ResponseHandler.success(
                    "Room maintenance updated successfully",
                    responseData
            );
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            log.error("Error updating room maintenance", e);
            Response<RoomMaintenanceResponse> response = ResponseHandler.failure(
                    "Failed to update maintenance: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }



    /**
     * Assign staff to a maintenance record.
     * POST /maintenance/assign/{maintenanceId}
     */
    @PostMapping("/assign/{maintenanceId}")
    public ResponseEntity<Response<RoomMaintenanceResponse>> assignStaff(
            @PathVariable("maintenanceId") Long maintenanceId,
            @RequestParam String staffName) {

        log.info("Assigning staff '{}' to maintenance record {}", staffName, maintenanceId);

        try {
            RoomMaintenanceResponse responseData =
                    maintenanceService.assignStaff(maintenanceId, staffName);

            Response<RoomMaintenanceResponse> response = ResponseHandler.success(
                    "Staff assigned successfully",
                    responseData
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error assigning staff", e);
            Response<RoomMaintenanceResponse> response = ResponseHandler.failure(
                    "Failed to assign staff: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }



    /**
     * Get maintenance record by room ID.
     * GET /maintenance/room/{roomId}
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Response<RoomMaintenanceResponse>> getByRoomId(
            @PathVariable("roomId") Long roomId) {

        log.info("Fetching maintenance for room: {}", roomId);

        try {
            RoomMaintenanceResponse responseData = maintenanceService.getByRoomId(roomId);

            Response<RoomMaintenanceResponse> response = ResponseHandler.success(
                    "Maintenance record fetched successfully",
                    responseData
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching maintenance for room {}", roomId, e);

            Response<RoomMaintenanceResponse> response = ResponseHandler.failure(
                    "Maintenance not found: " + e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

}
