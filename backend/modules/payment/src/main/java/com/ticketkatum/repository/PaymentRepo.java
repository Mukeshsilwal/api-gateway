package com.ticketkatum.repository;

import com.ticketkatum.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {

    Payment findByTxnId(String txnId);
}
