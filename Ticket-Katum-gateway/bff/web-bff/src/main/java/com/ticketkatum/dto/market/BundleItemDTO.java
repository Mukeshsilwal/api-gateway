package com.ticketkatum.dto.market;

import com.ticketkatum.webbff.dto.market.ItemType;
import lombok.Data;

import java.util.UUID;

@Data
public class BundleItemDTO {
    private UUID id;
    private ItemType itemType; // EVENT, HOTEL, BUS
    private String referenceId; // EventID / HotelID
}
