package com.ticketkatum.dto.hotel;

import com.ticketkatum.dto.hotel.response.RoomMaintenanceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedRoomDTO {
    private RoomDTO room;
    private RoomMaintenanceResponse maintenanceStatus;
    private boolean isUnderMaintenance;
}
