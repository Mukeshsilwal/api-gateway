package com.ticketkatum.service;


import com.ticketkatum.model.RoomMaintenanceRequest;
import com.ticketkatum.model.RoomMaintenanceResponse;

public interface RoomMaintenanceService {

    /**
     * Create or update maintenance record for a room.
     *
     * @param request Room maintenance request payload
     * @return RoomMaintenanceResponse
     */
    RoomMaintenanceResponse createOrUpdate(RoomMaintenanceRequest request);

    /**
     * Assign staff to a room maintenance task.
     *
     * @param maintenanceId the maintenance record ID
     * @param staffName staff full name
     * @return RoomMaintenanceResponse
     */
    RoomMaintenanceResponse assignStaff(Long maintenanceId, String staffName);

    /**
     * Get maintenance details for a room.
     *
     * @param roomId room ID
     * @return RoomMaintenanceResponse
     */
    RoomMaintenanceResponse getByRoomId(Long roomId);
}
