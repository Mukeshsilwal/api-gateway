package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
