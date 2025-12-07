package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private Map<String, Integer> staffByRole;
    private Map<String, Integer> roomsByType;
    private Map<String, BigDecimal> revenueMetrics;
    private List<MaintenanceAlert> maintenanceAlerts;
}
