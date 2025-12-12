package com.ticketkatum.webbff.dto.market;

import com.ticketkatum.dto.market.CrowdZoneDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OrganizerDashboardDTO {
    private List<CrowdZoneDTO> crowdStats;
    // Add sales stats later
}
