package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.LoyaltyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LoyaltyProfileRepository extends JpaRepository<LoyaltyProfile, Long> {
}
