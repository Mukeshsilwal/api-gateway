package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceAlert {
    private Long roomId;
    private String status;
    private String issueType;
    private String priority;
}
