package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCreationRequest {
    private long busId;
    private String  sourceName;
    private String destinationName;
}
