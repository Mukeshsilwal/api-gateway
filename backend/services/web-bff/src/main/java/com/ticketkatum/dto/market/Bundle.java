package com.ticketkatum.dto.market;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bundle {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal totalPrice;
    private BigDecimal discountPercentage;
    private boolean active;

    @Builder.Default
    private List<BundleItem> items = new ArrayList<>();
}
