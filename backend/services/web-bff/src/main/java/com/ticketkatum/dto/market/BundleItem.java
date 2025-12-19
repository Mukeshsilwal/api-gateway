package com.ticketkatum.dto.market;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BundleItem {

    private UUID id;
    @JsonIgnore
    private Bundle bundle;
    private ItemType itemType;
    private String itemReferenceId;
    private String subReferenceId;
    private int quantity;
}
