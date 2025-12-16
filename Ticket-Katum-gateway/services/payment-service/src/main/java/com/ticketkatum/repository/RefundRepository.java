package com.ticketkatum.repository;

import com.ticketkatum.entity.Refund;
import com.ticketkatum.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findByRefundId(String refundId);

    Optional<Refund> findByTicketId(Long ticketId);

    List<Refund> findByUserId(Long userId);

    List<Refund> findByStatus(RefundStatus status);

    List<Refund> findByUserIdAndStatus(Long userId, RefundStatus status);

    @Query("SELECT r FROM Refund r WHERE r.status = :status AND r.retryCount < 3 AND r.requestedAt > :cutoffTime")
    List<Refund> findPendingRefundsForRetry(RefundStatus status, LocalDateTime cutoffTime);

    boolean existsByTicketId(Long ticketId);

    @Query("SELECT COUNT(r) FROM Refund r WHERE r.userId = :userId AND r.requestedAt > :since")
    Long countUserRefundsSince(Long userId, LocalDateTime since);
}