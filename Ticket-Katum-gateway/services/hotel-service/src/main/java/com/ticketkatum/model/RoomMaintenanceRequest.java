package com.ticketkatum.model;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomMaintenanceRequest {

    @NotNull
    private Long roomId;

    private String roomStatus;
    private String cleaningStatus;
    private String maintenanceStatus;

    private Map<String, Boolean> amenitiesStatus;

    private List<String> suggestions;

    private String assignedStaff;
}
