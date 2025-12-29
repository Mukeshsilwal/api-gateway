package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bundles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    private BigDecimal discountPercentage;

    private boolean active;

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BundleItem> items = new ArrayList<>();
}
