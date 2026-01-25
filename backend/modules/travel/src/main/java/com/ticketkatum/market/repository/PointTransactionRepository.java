package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(long userId);
}
