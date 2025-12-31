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

    // Available options for this room
    private java.util.List<com.ticketkatum.dto.hotel.booking.RentTypeDto> availableRentTypes;
    private java.util.List<com.ticketkatum.dto.hotel.booking.MealPlanDto> availableMealPlans;
}
