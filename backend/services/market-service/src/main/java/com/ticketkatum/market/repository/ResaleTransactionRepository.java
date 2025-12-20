package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.ResaleTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResaleTransactionRepository extends JpaRepository<ResaleTransaction, Long> {
    List<ResaleTransaction> findByBuyerUserId(long buyerUserId);
    List<ResaleTransaction> findBySellerUserId(long sellerUserId);
}
