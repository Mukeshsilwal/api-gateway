package com.ticketkatum.repository;

import com.ticketkatum.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository <PaymentTransaction, Long>{
    Optional<PaymentTransaction> findByInternalTxnId(String txnId);
}
