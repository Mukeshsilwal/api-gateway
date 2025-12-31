package com.ticketkatum.dto.market;

import com.ticketkatum.webbff.dto.market.ProductDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LiveDashboardDTO {
    private List<CrowdZoneDTO> heatmap;
    private List<LivePollDTO> activePolls;
    private List<ProductDTO> menu;
}
