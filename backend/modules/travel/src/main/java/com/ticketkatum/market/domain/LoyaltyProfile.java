package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyProfile {

    @Id
    @Column(name = "user_id")
    private long userId;

    private int pointsBalance;

    private int lifetimePoints;

    @Enumerated(EnumType.STRING)
    private TierLevel tierLevel;
}
