package com.ticketkatum.dto.hotel.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMaintenanceResponse {

    private Long id;

    private String roomStatus;
    private String cleaningStatus;
    private String maintenanceStatus;

    // Amenity → boolean (OK/Not OK)
    private Map<String, Boolean> amenitiesStatus;

    // List of problems or suggestions
    private List<String> suggestions;

    // Assigned staff name or ID
    private String assignedStaff;

    private LocalDateTime lastUpdated;

    // Room info for dashboard
    private Long roomId;
    private String roomNumber;
    private String roomType;
}
