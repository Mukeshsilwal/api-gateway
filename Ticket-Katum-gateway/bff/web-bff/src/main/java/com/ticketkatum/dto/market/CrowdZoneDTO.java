package com.ticketkatum.dto.market;

import com.ticketkatum.webbff.dto.market.ZoneStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class CrowdZoneDTO {
    private UUID id;
    private String zoneName;
    private int capacity;
    private int currentOccupancy;
    private ZoneStatus status;
}
