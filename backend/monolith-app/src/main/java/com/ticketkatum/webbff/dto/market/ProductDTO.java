package com.ticketkatum.webbff.dto.market;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductDTO {
    private UUID id;
    private String name;
    private BigDecimal price;
    private ProductType type;
    private String imageUrl;
}
