package com.ticketkatum.repository;

import com.ticketkatum.entity.CancelLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository
public interface CancelLogRepo extends JpaRepository<CancelLog, Long> {

    List<CancelLog> findByBookingId(Long bookingId);
}
