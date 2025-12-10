package com.ticketkatum.dto.hotel;

import com.ticketkatum.dto.hotel.response.RoomMaintenanceResponse;
import com.ticketkatum.enums.StaffType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelManagementDashboard {
    private HotelDTO hotel;
    private int totalRooms;
    private int availableRooms;
    private int occupiedRooms;
    private int roomsUnderMaintenance;
    private int totalStaff;
    private int activeStaff;
    private List<RoomMaintenanceResponse> maintenanceRecords;
    private Map<StaffType, Integer> staffByRole;
    private Map<String, Integer> roomsByType;
    private Map<String, BigDecimal> revenueMetrics;
    private List<MaintenanceAlert> maintenanceAlerts;
}
