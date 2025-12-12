package com.ticketkatum.dto.market;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class BundleDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discount;
    private List<BundleItemDTO> items;
}
