package com.ticketkatum.market.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "bundle_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BundleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id")
    @JsonIgnore
    private Bundle bundle;

    @Enumerated(EnumType.STRING)
    private ItemType itemType;

    // ID of the Hotel, Event, or Bus Route
    private String itemReferenceId;

    // Optional: Specific sub-type like RoomType ID or TicketCategory ID
    private String subReferenceId;

    private int quantity;
}
