package com.ticketkatum.repository;

import com.ticketkatum.entity.RefundLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundLogRepo extends JpaRepository<RefundLog, Long> {

    List<RefundLog> findByBookingId(Long bookingId);
}
