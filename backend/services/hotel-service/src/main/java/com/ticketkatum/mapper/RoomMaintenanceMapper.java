package com.ticketkatum.mapper;

import com.ticketkatum.entity.RoomMaintenance;
import com.ticketkatum.model.RoomMaintenanceResponse;
import org.springframework.stereotype.Component;

@Component
public class RoomMaintenanceMapper {

    public RoomMaintenanceResponse toResponse(RoomMaintenance m) {

        if (m == null) return null;

        return RoomMaintenanceResponse.builder()
                .id(m.getId())
                .roomId(m.getRoom() != null ? m.getRoom().getId() : null)
                .roomNumber(m.getRoom() != null ? m.getRoom().getRoomNumber() : null)
                .roomStatus(m.getRoomStatus())
                .cleaningStatus(m.getCleaningStatus())
                .maintenanceStatus(m.getMaintenanceStatus())
                .amenitiesStatus(m.getAmenitiesStatus())
                .suggestions(m.getSuggestions() != null ? m.getSuggestions() : java.util.List.of())
                .assignedStaff(m.getAssignedStaff())
                .lastUpdated(m.getLastUpdated())
                .build();
    }
}
