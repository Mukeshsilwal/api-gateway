package com.ticketkatum.model;

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

    private Long roomId;
    private String roomNumber;

    private String roomStatus;
    private String cleaningStatus;
    private String maintenanceStatus;

    private Map<String, Boolean> amenitiesStatus;
    private List<String> suggestions;

    private String assignedStaff;

    private LocalDateTime lastUpdated;
}
